import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ChatInput from '@/components/ChatInput.jsx';
import { submitDesignRequest } from '@/api/geometricModelingAPI';
import { uploadFileAPI } from '@/api/fileAPI.js';
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

const AiMessage = ({ message }) => (
  <div className="flex items-start my-4">
    <Avatar className="mr-4">
      <AvatarFallback>O</AvatarFallback>
    </Avatar>
    <div className="bg-gray-100 rounded-lg p-4 max-w-2xl prose">
      <ReactMarkdown>{message.content || ''}</ReactMarkdown>
      {message.fileName && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">{message.fileName}</span>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon"><Code className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  </div>
);


const GeometricModelingPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isStreaming) return;

    let userMessageContent = inputValue;
    let fileUrl = null;

    setIsStreaming(true);

    // 1. 如果有文件，先上传文件
    if (selectedFile) {
      try {
        const uploadResponse = await uploadFileAPI(selectedFile);
        if (uploadResponse.code === 200) {
          fileUrl = uploadResponse.data.url;
          // 可以选择将文件名或URL附加到消息中
          userMessageContent += `\n(已上传文件: ${selectedFile.name})`;
        } else {
          throw new Error('File upload failed');
        }
      } catch (error) {
        console.error("File upload failed:", error);
        const errorMessage = { role: 'ai', content: '抱歉，文件上传失败，请稍后再试。' };
        setMessages(prev => [...prev, errorMessage]);
        setIsStreaming(false);
        return;
      }
    }

    const userMessage = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null); // 清空已选文件

    try {
      // 2. 发送包含文件信息的消息
      const { data } = await submitDesignRequest(inputValue, fileUrl);
      console.log(fileUrl);
      const fullResponse = data.response.trim();
      
      const aiMessagePlaceholder = { role: 'ai', content: '', fileName: data.fileName };
      setMessages(prev => [...prev, aiMessagePlaceholder]);

      const streamResponse = (index) => {
        if (index >= fullResponse.length) {
          setIsStreaming(false);
          return;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: newMessages[newMessages.length - 1].content + fullResponse[index],
          };
          return newMessages;
        });

        setTimeout(() => streamResponse(index + 1), 50);
      };

      streamResponse(0);

    } catch (error) {
      console.error("Failed to fetch design request:", error);
      const errorMessage = { role: 'ai', content: '抱歉，我暂时无法回答您的问题。' };
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'ai' && lastMessage.content === '') {
          return [...prev.slice(0, -1), errorMessage];
        }
        return [...prev, errorMessage];
      });
      setIsStreaming(false);
    }
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
