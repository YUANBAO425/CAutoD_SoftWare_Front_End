import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Share2 } from 'lucide-react';
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
    <div className="bg-purple-600 text-white rounded-lg p-3 max-w-lg">
      {content}
    </div>
  </div>
);

const PartCard = ({ part }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {part.isLoading ? (
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    ) : (
      <img src={part.imageUrl} alt={part.name} className="w-full h-40 object-cover" />
    )}
    <div className="p-4 flex items-center justify-between">
      <span className="text-sm font-medium">{part.name}</span>
      <div className="flex space-x-1">
        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
      </div>
    </div>
  </div>
);

const AiMessage = ({ message }) => (
  <div className="flex items-start my-4">
    <Avatar className="mr-4">
      <AvatarFallback>O</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="mb-4">{message.text}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {message.parts.map(part => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </div>
  </div>
);

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

const PartRetrievalPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const { activeConversationId, createTask } = useConversationStore();

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isLoading || !activeConversationId) return;

    let userMessageContent = inputValue;
    let fileUrl = null;

    setIsLoading(true);

    if (selectedFile) {
      try {
        const uploadResponse = await uploadFileAPI(selectedFile);
        if (uploadResponse.code === 200) {
          fileUrl = uploadResponse.data.url;
          userMessageContent += `\n(已上传文件: ${selectedFile.name})`;
        } else {
          throw new Error('File upload failed');
        }
      } catch (error) {
        console.error("File upload failed:", error);
        const errorMessage = { role: 'ai', text: '抱歉，文件上传失败，请稍后再试。', parts: [] };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
    }

    const userMessage = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null);

    try {
      let taskIdToUse = currentTaskId;

      // 1. 如果没有当前任务ID，则创建一个新任务
      if (!taskIdToUse) {
        const newTask = await createTask({
          conversation_id: activeConversationId,
          task_type: 'part_retrieval',
          details: { query: inputValue, fileName: selectedFile?.name }
        });
        if (!newTask) throw new Error("Task creation failed");
        taskIdToUse = newTask.task_id;
        setCurrentTaskId(taskIdToUse); // 保存新任务ID
      }

      // 2. 执行统一的任务API
      const response = await executeTaskAPI({
        task_type: 'part_retrieval',
        query: inputValue, 
        file_url: fileUrl, 
        conversation_id: activeConversationId,
        task_id: taskIdToUse // 使用保存的或新创建的任务ID
      });
      const allParts = response.data.parts;
      
      const aiMessagePlaceholder = {
        role: 'ai',
        text: '以下是为您找到的零件替换方案：',
        parts: [],
      };
      setMessages(prev => [...prev, aiMessagePlaceholder]);

      const streamParts = (index) => {
        if (index >= allParts.length) {
          setIsLoading(false);
          return;
        }
        
        const partPlaceholder = { ...allParts[index], isLoading: true };
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].parts.push(partPlaceholder);
          return newMessages;
        });

        setTimeout(() => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastAiMessage = newMessages[newMessages.length - 1];
            const targetPart = lastAiMessage.parts[index];
            targetPart.isLoading = false;
            return newMessages;
          });
        }, 1500); // 模拟图片生成延迟

        setTimeout(() => streamParts(index + 1), 300); // 控制卡片出现速度
      };

      streamParts(0);

    } catch (error) {
      console.error("Failed to retrieve parts:", error);
      const errorMessage = {
        role: 'ai',
        text: '抱歉，检索零件时出错，请稍后再试。',
        parts: [],
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // 初始视图
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white pb-40">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">您想查找什么样的零件？</h1>
          <ConversationSelector />
          <ChatInput
            inputValue={inputValue}
            onInputChange={(e) => setInputValue(e.target.value)}
            onSendMessage={handleSendMessage}
            isStreaming={isLoading}
            placeholder="例如：一个高强度的机械臂爪"
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            isInitialView={true}
            disabled={!activeConversationId}
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
            : <AiMessage key={index} message={msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'ai' && messages[messages.length - 1]?.parts.length === 0 && (
          <p className="text-center text-gray-500">正在检索中...</p>
        )}
      </div>
      <div className="mt-auto">
        <ChatInput
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSendMessage={handleSendMessage}
          isStreaming={isLoading}
          placeholder="继续提问或优化..."
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>
    </div>
  );
};

export default PartRetrievalPage;
