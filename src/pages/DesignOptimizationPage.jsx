import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { executeTaskAPI } from '@/api/taskAPI';
import { uploadFileAPI } from '@/api/fileAPI.js';
import { Upload } from 'lucide-react';
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

const WorkflowGuide = () => (
  <div className="text-left max-w-2xl mx-auto bg-green-50 p-4 rounded-lg border border-green-200 mb-8">
    <h2 className="text-lg font-semibold text-green-800 mb-2">第二步：设计优化</h2>
    <ol className="list-decimal list-inside text-gray-700 space-y-1">
      <li>请先在【几何建模】页面完成初始模型的设计和导出。</li>
      <li>上传您在 SolidWorks 中处理过的 <strong>.sldprt</strong> 文件。</li>
      <li>点击下方的“开始优化”按钮，系统将对上传的模型进行分析与优化。</li>
      <li>系统将执行优化，您可以根据结果进行多轮迭代，直到满意为止。</li>
    </ol>
  </div>
);

const FileUploadComponent = ({ onFileSelect, onStart, selectedFile, isStreaming, disabled }) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-xs mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".sldprt"
      />
      <Button onClick={handleButtonClick} disabled={isStreaming || disabled} variant="outline" className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {selectedFile ? `已选择: ${selectedFile.name}` : '选择 .sldprt 文件'}
      </Button>
      <Button onClick={onStart} disabled={!selectedFile || isStreaming || disabled} size="lg" className="w-full">
        开始优化
      </Button>
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
    updateLastAiMessage, // 使用新的统一 action
  } = useConversationStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleStartOptimization = async () => {
    if (!selectedFile || isStreaming || !activeConversationId) return;

    setIsStreaming(true);
    const userMessageContent = `已上传文件进行优化: ${selectedFile.name}`;
    addMessage({ role: 'user', content: userMessageContent });
    addMessage({ role: 'assistant', content: '', task_type: 'optimize' }); // AI 回复占位符，并带上任务类型

    const taskType = 'optimize';
    const query = `请对上传的文件 ${selectedFile.name} 进行设计优化。`;
    let taskIdToUse = activeTaskId;

    // 1. 如果没有当前任务ID，则创建一个新任务
    try {
      if (!taskIdToUse) {
        const newTask = await createTask({
          conversation_id: activeConversationId,
          task_type: taskType,
          details: { query: query, fileName: selectedFile?.name }
        });
        if (!newTask) throw new Error("Task creation failed");
        taskIdToUse = newTask.task_id;
      }
    } catch (error) {
        console.error("Failed to create task:", error);
        updateLastAiMessage({
            finalData: { answer: "抱歉，创建任务时出现错误。", metadata: {} },
        });
        setIsStreaming(false);
        return;
    }

    // 2. 上传文件，并附带会话和任务ID
    let fileUrl = null;
    try {
      const uploadResponse = await uploadFileAPI(selectedFile, activeConversationId, taskIdToUse);
      if (uploadResponse && uploadResponse.path) {
        fileUrl = uploadResponse.path;
      } else {
        throw new Error('File upload failed: Invalid response from server');
      }
    } catch (error) {
      console.error("File upload failed:", error);
      updateLastAiMessage({
        finalData: { answer: "抱歉，文件上传失败。", metadata: {} },
      });
      setIsStreaming(false);
      return;
    }
    
    // 3. 执行任务
    try {
      const requestData = {
        task_type: taskType,
        query: query,
        file_url: fileUrl,
        conversation_id: activeConversationId,
        task_id: taskIdToUse,
      };

      executeTaskAPI({
        ...requestData,
        response_mode: "streaming",
        onMessage: {
          text_chunk: (data) => {
            updateLastAiMessage({ textChunk: data.text });
          },
          image_chunk: (data) => {
            updateLastAiMessage({ image: data });
          },
          message_end: (data) => {
            updateLastAiMessage({ finalData: data });
          },
        },
        onError: (error) => {
          console.error("SSE error:", error);
          updateLastAiMessage({
            finalData: {
              answer: "抱歉，请求出错，请稍后再试。",
              metadata: {},
            },
          });
          setIsStreaming(false);
        },
        onClose: () => setIsStreaming(false),
      });

    } catch (error) {
      console.error("Failed to start optimization task:", error);
      updateLastAiMessage({
        finalData: {
          answer: "抱歉，启动优化任务时出现错误。",
          metadata: {},
        },
      });
      setIsStreaming(false);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white pb-40">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">上传文件以开始优化</h1>
          <WorkflowGuide />
          <ConversationSelector />
          <FileUploadComponent
            onFileSelect={setSelectedFile}
            onStart={handleStartOptimization}
            selectedFile={selectedFile}
            isStreaming={isStreaming}
            disabled={!activeConversationId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ConversationDisplay messages={messages} isLoading={isLoadingMessages} />
      <div className="mt-auto p-4 border-t">
        <FileUploadComponent
          onFileSelect={setSelectedFile}
          onStart={handleStartOptimization}
          selectedFile={selectedFile}
          isStreaming={isStreaming}
          disabled={!activeConversationId || isStreaming}
        />
      </div>
    </div>
  );
};

export default DesignOptimizationPage;
