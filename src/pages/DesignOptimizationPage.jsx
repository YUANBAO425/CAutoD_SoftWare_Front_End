import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { executeTaskAPI } from '@/api/taskAPI';
import { uploadFileAPI } from '@/api/fileAPI.js';
import ChatInput from '@/components/ChatInput.jsx';
import useConversationStore from '@/store/conversationStore';
import ConversationDisplay from '@/components/ConversationDisplay.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";

const ConversationSelector = () => {
  const { conversations, activeConversationId, setActiveConversationId } = useConversationStore();

  if (conversations.length === 0) {
    return <p className="text-center text-gray-500">请先创建一个对话。</p>;
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
  const {
    messages,
    addMessage,
    isLoadingMessages,
    activeConversationId,
    activeTaskId,
    createTask,
    replaceLastMessage,
    updateLastMessageContent,
  } = useConversationStore();
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isStreaming || !activeConversationId) return;

    let userMessageContent = inputValue;
    let fileUrl = null;

    addMessage({ role: 'user', content: userMessageContent });
    setInputValue('');
    setIsStreaming(true);

    if (selectedFile) {
      try {
        const uploadResponse = await uploadFileAPI(selectedFile);
        fileUrl = uploadResponse.data.url;
      } catch (error) {
        console.error("File upload failed:", error);
        addMessage({ role: 'ai', content: '抱歉，文件上传失败。' });
        setIsStreaming(false);
        return;
      }
    }
    
    addMessage({ role: 'ai', content: '' }); // AI 回复占位符

    try {
      let taskIdToUse = activeTaskId;
      const taskType = 'optimize';

      if (!taskIdToUse) {
        const newTask = await createTask({
          conversation_id: activeConversationId,
          task_type: taskType,
          details: { query: userMessageContent, fileName: selectedFile?.name }
        });
        if (!newTask) throw new Error("Task creation failed");
        taskIdToUse = newTask.task_id;
      }

      const requestData = {
        task_type: taskType,
        query: userMessageContent,
        file_url: fileUrl,
        conversation_id: activeConversationId,
        task_id: taskIdToUse,
      };

      executeTaskAPI({
        ...requestData,
        response_mode: "streaming",
        onMessage: {
          text_chunk: (data) => updateLastMessageContent(data.text),
          message_end: (data) => replaceLastMessage({ role: 'ai', content: data.answer, metadata: data.metadata }),
        },
        onError: () => replaceLastMessage({ role: 'ai', content: "抱歉，请求出错。" }),
        onClose: () => setIsStreaming(false),
      });

    } catch (error) {
      console.error("Failed to start optimization task:", error);
      replaceLastMessage({ role: 'ai', content: '抱歉，启动优化任务时出现错误。' });
      setIsStreaming(false);
    }
  };

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
            isStreaming={isStreaming}
            placeholder="例如：轻量化这个机械臂，要求满足材料应力约束"
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            isInitialView={true}
            disabled={!activeConversationId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ConversationDisplay messages={messages} isLoading={isLoadingMessages} />
      <div className="mt-auto p-8">
        <ChatInput
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          placeholder="继续提问或优化..."
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>
    </div>
  );
};

export default DesignOptimizationPage;
