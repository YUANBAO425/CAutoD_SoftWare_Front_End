import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, Share2, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ChatInput from '@/components/ChatInput.jsx';
import { streamGeometryModeling } from '@/api/geometricModelingAPI';
import { uploadFileAPI } from '@/api/fileAPI.js'; // 假设这个API也需要更新
import useUserStore from '@/store/userStore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SuggestionButton = ({ text }) => (
  <Button variant="outline" className="rounded-full bg-gray-50 text-gray-600">
    {text}
  </Button>
);

const UserMessage = ({ content }) => (
  <div className="flex justify-end my-4">
    <div className="bg-purple-600 text-white rounded-lg p-3 max-w-lg">
      {content}
    </div>
  </div>
);

const AiMessage = ({ message }) => {
  const { content, metadata } = message;

  return (
    <div className="flex items-start my-4">
      <Avatar className="mr-4">
        <AvatarFallback>O</AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-lg p-4 max-w-2xl prose">
        <ReactMarkdown>{content || ''}</ReactMarkdown>
        {metadata && (
          <div className="mt-4">
            {metadata.preview_image && (
              <img 
                src={metadata.preview_image} 
                alt="Model Preview" 
                className="rounded-lg shadow-md max-w-full"
              />
            )}
            <div className="flex items-center justify-end space-x-2 mt-2">
              {metadata.code_file && (
                <Button as="a" href={metadata.code_file} target="_blank" rel="noopener noreferrer" variant="ghost" size="icon" title="Download Code">
                  <Code className="h-4 w-4" />
                </Button>
              )}
              {metadata.cad_file && (
                <Button as="a" href={metadata.cad_file} target="_blank" rel="noopener noreferrer" variant="ghost" size="icon" title="Download CAD File">
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" title="Share">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const GeometricModelingPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [conversationId, setConversationId] = useState(null); // 新增
  const { user } = useUserStore();
  const { fetchHistory } = useOutletContext(); // 获取刷新函数

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isStreaming) return;

    let userMessageContent = inputValue;
    let filesForRequest = [];

    const userMessage = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    setIsStreaming(true);
    const aiMessagePlaceholder = { role: 'ai', content: '', metadata: null };
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    // 文件上传逻辑 (如果需要)
    if (selectedFile) {
      // 假设 uploadFileAPI 返回一个包含 url 的对象
      // const uploadedFile = await uploadFileAPI(selectedFile);
      // filesForRequest.push({
      //   type: 'image', // or other type
      //   transfer_method: 'remote_url',
      //   url: uploadedFile.url,
      // });
      setSelectedFile(null);
    }

    const requestData = {
      query: inputValue,
      response_mode: "streaming",
      user: user?.email || "anonymous", // 使用用户的 email 或一个匿名标识
      conversation_id: conversationId, // 使用状态中的 conversationId
      files: filesForRequest,
    };

    streamGeometryModeling({
      requestData,
      onOpen: () => {
        console.log("SSE connection opened.");
      },
      onMessage: ({ event, data }) => {
        if (event === 'conversation_info') {
          if (!conversationId) { // 仅在第一次收到时调用
            fetchHistory();
          }
          setConversationId(data.conversation_id);
          return; // 不更新消息
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];

          if (event === 'text_chunk') {
            lastMessage.content += data.text;
          } else if (event === 'message_end') {
            lastMessage.content = data.answer; // 确保最终文本是完整的
            lastMessage.metadata = data.metadata;
          }
          
          return newMessages;
        });
      },
      onError: (error) => {
        console.error("SSE error:", error);
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = "抱歉，请求出错，请稍后再试。";
          return newMessages;
        });
        setIsStreaming(false);
      },
      onClose: () => {
        console.log("SSE connection closed.");
        setIsStreaming(false);
      },
    });
  };

  // 初始视图
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white pb-40">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">您的设计需求是？</h1>
          <ChatInput
            inputValue={inputValue}
            onInputChange={(e) => setInputValue(e.target.value)}
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            placeholder="设计一个机械臂？"
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            isInitialView={true}
          />
          <div className="flex justify-center space-x-2 mt-4">
            <SuggestionButton text="3D" />
            <SuggestionButton text="建模" />
            <SuggestionButton text="需求" />
            <SuggestionButton text="图像" />
            <SuggestionButton text="文本" />
            <SuggestionButton text="代码" />
            <SuggestionButton text="文件导入/导出" />
          </div>
        </div>
      </div>
    );
  }

  // 对话视图
  return (
    <div className="flex flex-col h-full bg-white p-8">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, index) => (
          msg.role === 'user' 
            ? <UserMessage key={index} content={msg.content} />
            : <AiMessage key={index} message={msg} />
        ))}
      </div>
      <div className="mt-auto">
        <ChatInput
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          placeholder="设计优化"
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>
    </div>
  );
};

export default GeometricModelingPage;
