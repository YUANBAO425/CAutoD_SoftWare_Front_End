import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { executeTaskAPI } from '@/api/taskAPI';
import { uploadFileAPI, downloadFileAPI } from '@/api/fileAPI.js';
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
        if (uploadResponse && uploadResponse.path) {
          fileUrl = uploadResponse.path;
          userMessageContent += `\n(已上传文件: ${selectedFile.name})`;
        } else {
          throw new Error('File upload failed: Invalid response from server');
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

      // 2. 执行任务API (流式)
      executeTaskAPI({
        task_type: 'retrieval',
        query: inputValue,
        file_url: fileUrl,
        conversation_id: activeConversationId,
        task_id: taskIdToUse,
        response_mode: "streaming",
        onMessage: {
          conversation_info: (data) => {
            // setActiveTaskId(data.task_id); // store action 会自动设置
            // 可以在这里添加一个空的AI消息作为占位符
            addMessage({ role: 'ai', content: '', parts: [] });
          },
          text_chunk: (data) => {
            useConversationStore.getState().updateLastAiMessage({ textChunk: data.text });
          },
          part_chunk: (data) => {
            // 现在 sse 函数直接传递 part 对象，所以 data 就是 part
            useConversationStore.getState().updateLastAiMessage({ part: data });
          },
          message_end: (data) => {
            console.log("Stream finished:", data);
            setIsLoading(false);
          },
          error: (error) => {
            console.error("SSE Error:", error);
            addMessage({ role: 'ai', content: '抱歉，检索零件时发生流式错误。' });
            setIsLoading(false);
          },
        },
        onClose: () => {
          setIsLoading(false);
          console.log("SSE Connection closed.");
        },
        onError: (error) => {
           console.error("SSE Connection Error:", error);
           addMessage({ role: 'ai', content: '抱歉，连接服务器时出错。' });
           setIsLoading(false);
        }
      });

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
