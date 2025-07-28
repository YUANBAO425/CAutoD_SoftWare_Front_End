import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download } from 'lucide-react';
import { optimizeDesign } from '@/api/designOptimizationAPI';
import { uploadFileAPI } from '@/api/fileAPI.js';
import ChatInput from '@/components/ChatInput.jsx';

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
  if (!message.result) {
    return (
      <div className="flex items-start my-4">
        <Avatar className="mr-4">
          <AvatarFallback>O</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-gray-100 rounded-lg p-4">
          <p>{message.text || ''}</p>
          {message.isLoading && <ImagePlaceholder />}
        </div>
      </div>
    );
  }

  const { optimized_file, best_params, final_volume, final_stress, unit, constraint_satisfied } = message.result;

  return (
    <div className="flex items-start my-4">
      <Avatar className="mr-4">
        <AvatarFallback>O</AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-gray-100 rounded-lg p-4 prose">
        <h4>优化结果</h4>
        <p>优化后的文件: <strong>{optimized_file}</strong></p>
        <p>最优参数: <code>[{best_params.join(', ')}]</code></p>
        <p>最终体积: {final_volume} {unit.volume}</p>
        <p>最终应力: {final_stress} {unit.stress}</p>
        <p>约束满足情况: {constraint_satisfied ? '是' : '否'}</p>
        <Button><Download className="mr-2 h-4 w-4" /> 下载优化后的文件</Button>
      </div>
    </div>
  );
};

const DesignOptimizationPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSendMessage = async () => {
    if (!selectedFile || isStreaming) return;

    const userMessage = { role: 'user', content: `优化文件: ${selectedFile.name}` };
    setMessages(prev => [...prev, userMessage]);
    
    setIsStreaming(true);
    const aiMessagePlaceholder = { role: 'ai', text: '正在处理您的优化请求...', result: null, isLoading: true };
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    try {
      // 在真实应用中，你可能需要解析 inputValue 来获取 constraints, parameters 等
      const requestData = {
        method: 0, // or 1, based on user selection
        file: selectedFile.name,
        // constraints: {}, 
        // parameters: [],
        // target: "minimize_volume",
      };

      const response = await optimizeDesign(requestData);
      const result = JSON.parse(response); // 后端返回的是 JSON 字符串

      setMessages(prev => prev.map((msg, i) =>
        i === prev.length - 1 ? { ...msg, text: '优化完成！', result: result, isLoading: false } : msg
      ));

    } catch (error) {
      console.error("Failed to optimize design:", error);
      const errorMessage = { role: 'ai', text: '抱歉，优化时出现错误。', result: null, isLoading: false };
      setMessages(prev => prev.map((msg, i) =>
        i === prev.length - 1 ? errorMessage : msg
      ));
    } finally {
      setIsStreaming(false);
      setInputValue('');
      setSelectedFile(null);
    }
  };

  // 初始视图
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white pb-40">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">需要我为您优化什么？</h1>
          <ChatInput
            inputValue={inputValue}
            onInputChange={(e) => setInputValue(e.target.value)}
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
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
          isStreaming={isStreaming}
          placeholder="模型保存"
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>
    </div>
  );
};

export default DesignOptimizationPage;
