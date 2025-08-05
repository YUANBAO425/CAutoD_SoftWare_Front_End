import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { executeTaskAPI } from '@/api/taskAPI';
import { uploadFileAPI } from '@/api/fileAPI.js';
import ChatInput from '@/components/ChatInput.jsx';
import useConversationStore from '@/store/conversationStore';
import ConversationDisplay from '@/components/ConversationDisplay.jsx'; // 导入新组件
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";

// PartCard 和 ConversationSelector 保持不变
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
  // 从 store 获取消息列表和加载状态
  const { messages, addMessage, isLoadingMessages, activeConversationId, createTask, activeTaskId } = useConversationStore();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
        addMessage({ role: 'ai', content: '抱歉，文件上传失败，请稍后再试。' });
        setIsLoading(false);
        return;
      }
    }

    const userMessage = { role: 'user', content: userMessageContent };
    addMessage(userMessage);

    // 清理输入框
    setInputValue('');
    setSelectedFile(null);

    try {
      let taskIdToUse = activeTaskId;
      const taskType = 'retrieval'; // 当前页面的任务类型

      // 1. 如果没有当前任务ID，则创建一个新任务
      if (!taskIdToUse) {
        const newTask = await createTask({
          conversation_id: activeConversationId,
          task_type: taskType,
          details: { query: inputValue, fileName: selectedFile?.name }
        });
        if (!newTask) throw new Error("Task creation failed");
        taskIdToUse = newTask.task_id;
        // setActiveTaskId(taskIdToUse); // store action 会自动设置
      }

      // 2. 执行任务API (后端现在会自动保存用户消息)
      const response = await executeTaskAPI({
        task_type: 'retrieval',
        query: inputValue, 
        file_url: fileUrl, 
        conversation_id: activeConversationId,
        task_id: taskIdToUse // 使用保存的或新创建的任务ID
      });
      const allParts = response.data.parts;
      
      // 模拟AI回复
      const aiMessage = {
        role: 'ai',
        content: `已为您找到 ${allParts.length} 个相关零件。`, // 这是一个示例回复
      };
      addMessage(aiMessage);
      
      setIsLoading(false);

      // TODO: 这里的 streamParts 逻辑需要被重构以适应新的 store 模式
      // 暂时禁用以避免错误
      /*
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

      // streamParts(0);
      */

    } catch (error) {
      console.error("Failed to retrieve parts:", error);
      addMessage({ role: 'ai', content: '抱歉，检索零件时出错，请稍后再试。' });
      setIsLoading(false);
    }
  };

  // 如果正在从历史记录加载消息，则显示加载状态
  if (isLoadingMessages) {
    return <div className="flex items-center justify-center h-full">正在加载对话记录...</div>;
  }

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
    <div className="flex flex-col h-full bg-white">
      <ConversationDisplay messages={messages} isLoading={isLoadingMessages} />
      <div className="mt-auto p-8">
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
