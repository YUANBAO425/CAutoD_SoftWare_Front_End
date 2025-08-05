import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, Share2, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ChatInput from '@/components/ChatInput.jsx';
import { executeTaskAPI } from '@/api/taskAPI';
import { uploadFileAPI } from '@/api/fileAPI.js';
import useUserStore from '@/store/userStore';
import useConversationStore from '@/store/conversationStore';
import ConversationDisplay from '@/components/ConversationDisplay.jsx';

const SuggestionButton = ({ text }) => (
  <Button variant="outline" className="rounded-full bg-gray-50 text-gray-600">
    {text}
  </Button>
);

const GeometricModelingPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useUserStore();
  const {
    messages,
    addMessage,
    updateLastMessageContent,
    replaceLastMessage,
    isLoadingMessages,
    activeTaskId,
    setActiveTaskId,
    ensureConversation,
    createTask,
  } = useConversationStore();
  const { fetchHistory } = useOutletContext();

  // 当 activeConversationId 变为 null 时，重置页面状态
  useEffect(() => {
    // This logic is now handled by the startNewConversation action
    // and the initial state of the page component.
  }, []);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isStreaming) return;

    let userMessageContent = inputValue;
    let filesForRequest = [];

    const userMessage = { role: 'user', content: userMessageContent };
    addMessage(userMessage);
    setInputValue('');
    
    setIsStreaming(true);
    const aiMessagePlaceholder = { role: 'ai', content: '', metadata: null };
    addMessage(aiMessagePlaceholder);

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

    // 1. 确保对话存在
    const conversationId = await ensureConversation(inputValue.substring(0, 20));
    if (!conversationId) {
      console.error("无法获取或创建对话，任务中止。");
      setIsStreaming(false);
      return;
    }

    let taskIdToUse = activeTaskId;

    // 2. 如果没有当前任务ID，则创建一个新任务
    if (!taskIdToUse) {
      const newTask = await createTask({
        conversation_id: conversationId,
        task_type: 'geometry',
        details: { query: inputValue.substring(0, 50) }
      });
      if (!newTask) {
        console.error("无法创建任务，任务中止。");
        setIsStreaming(false);
        return;
      }
      taskIdToUse = newTask.task_id;
      // setActiveTaskId(taskIdToUse); // createTask action 已经设置了
    }

    // 3. 准备并执行任务
    const requestData = {
      query: inputValue,
      user: user?.email || "anonymous",
      conversation_id: conversationId,
      task_id: taskIdToUse, // 使用保存的或新创建的任务ID
      task_type: 'geometry',
      files: filesForRequest,
    };

    executeTaskAPI({
      ...requestData,
      response_mode: "streaming",
      onMessage: {
        conversation_info: (data) => {
          console.log("Task and conversation info received:", data);
          // 可以在这里更新UI，例如显示任务ID
        },
        text_chunk: (data) => {
          updateLastMessageContent(data.text);
        },
        message_end: (data) => {
          const finalMessage = {
            role: 'ai',
            content: data.answer,
            metadata: data.metadata,
          };
          replaceLastMessage(finalMessage);
        },
      },
      onError: (error) => {
        console.error("SSE error:", error);
        const errorMessage = {
          role: 'ai',
          content: "抱歉，请求出错，请稍后再试。",
        };
        replaceLastMessage(errorMessage);
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
    <div className="flex flex-col h-full bg-white">
      <ConversationDisplay messages={messages} isLoading={isLoadingMessages} />
      <div className="mt-auto p-8">
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
