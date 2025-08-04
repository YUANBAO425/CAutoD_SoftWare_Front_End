import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download } from 'lucide-react';
import { executeTaskAPI } from '@/api/taskAPI';
import { uploadFileAPI } from '@/api/fileAPI.js';
import ChatInput from '@/components/ChatInput.jsx';
import useConversationStore from '@/store/conversationStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";

const UserMessage = ({ content }) => (
  <div className="flex justify-end my-4">
    <div className="bg-gray-800 text-white rounded-lg p-3 max-w-lg">
      {content}
    </div>
  </div>
);

const ImagePlaceholder = () => (
  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
    <div className="flex space-x-2">
      <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse"></div>
    </div>
  </div>
);

const OptimizationResultMessage = ({ message }) => {
  const { text, metadata, isLoading } = message;

  return (
    <div className="flex items-start my-4">
      <Avatar className="mr-4">
        <AvatarFallback>O</AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-gray-100 rounded-lg p-4 prose">
        <p>{text || ''}</p>
        {isLoading && <ImagePlaceholder />}
        {metadata && (
          <div className="mt-4">
            <h4>优化结果</h4>
            <p>优化后的文件: <strong>{metadata.cad_file}</strong></p>
            {/* 这里可以根据需要展示更多元数据 */}
            <Button as="a" href={metadata.cad_file} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" /> 下载优化后的文件
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationSelector = () => {
  const { conversations, activeConversationId, setActiveConversationId } = useConversationStore();

  if (conversations.length === 0) {
    return <p className="text-center text-gray-500">请先在“几何建模”页面创建一个对话。</p>;
  }

  return (
    <div className="mb-4">
      <Select value={activeConversationId} onValueChange={setActiveConversationId}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="选择一个对话..." />
        </SelectTrigger>
        <SelectContent>
          {conversations.map(conv => (
            <SelectItem key={conv.conversation_id} value={conv.conversation_id}>
              {conv.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const DesignOptimizationPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const { activeConversationId, createTask } = useConversationStore();

  const handleSendMessage = async () => {
    if (!selectedFile || isLoading || !activeConversationId) return;

    setIsLoading(true);

    const userMessage = { role: 'user', content: `优化文件: ${selectedFile.name}` };
    setMessages(prev => [...prev, userMessage]);
    
    const aiMessagePlaceholder = { role: 'ai', text: '', metadata: null, isLoading: true };
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    try {
      let taskIdToUse = currentTaskId;

      if (!taskIdToUse) {
        const newTask = await createTask({
          conversation_id: activeConversationId,
          task_type: 'optimize',
          details: { fileName: selectedFile.name }
        });
        if (!newTask) throw new Error("Task creation failed");
        taskIdToUse = newTask.task_id;
        setCurrentTaskId(taskIdToUse);
      }

      const requestData = {
        task_type: 'optimize',
        file: selectedFile.name, // 假设后端需要文件名
        conversation_id: activeConversationId,
        task_id: taskIdToUse,
      };

      executeTaskAPI({
        ...requestData,
        response_mode: "streaming",
        onMessage: {
          conversation_info: (data) => {
            console.log("Task and conversation info received:", data);
          },
          text_chunk: (data) => {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              lastMessage.text += data.text;
              return newMessages;
            });
          },
          message_end: (data) => {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              lastMessage.text = data.answer;
              lastMessage.metadata = data.metadata;
              lastMessage.isLoading = false;
              return newMessages;
            });
          },
        },
        onError: (error) => {
          console.error("SSE error:", error);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            lastMessage.text = "抱歉，请求出错，请稍后再试。";
            lastMessage.isLoading = false;
            return newMessages;
          });
          setIsLoading(false);
        },
        onClose: () => {
          console.log("SSE connection closed.");
          setIsLoading(false);
        },
      });

    } catch (error) {
      console.error("Failed to start optimization task:", error);
      const errorMessage = { role: 'ai', text: '抱歉，启动优化任务时出现错误。', metadata: null, isLoading: false };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // 初始视图
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white pb-40">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">需要我为您优化什么？</h1>
          <ConversationSelector />
          <ChatInput
            inputValue={inputValue}
            onInputChange={(e) => setInputValue(e.target.value)}
            onSendMessage={handleSendMessage}
            isStreaming={isLoading}
            placeholder="例如：轻量化这个机械臂，要求满足材料应力约束"
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            isInitialView={true}
          />
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
            : <OptimizationResultMessage key={index} message={msg} />
        ))}
      </div>
      <div className="mt-auto">
        <ChatInput
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSendMessage={handleSendMessage}
          isStreaming={isLoading}
          placeholder="模型保存"
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>
    </div>
  );
};

export default DesignOptimizationPage;
