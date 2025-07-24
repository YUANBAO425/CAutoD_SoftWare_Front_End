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

const OptimizationResultMessage = ({ message }) => (
  <div className="flex items-start my-4">
    <Avatar className="mr-4">
      <AvatarFallback>O</AvatarFallback>
    </Avatar>
    <div className="flex-1 bg-gray-100 rounded-lg p-4">
      <p className="mb-4">{message.text || ''}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {message.simulationImages.map((src, index) => (
          <div key={index} className="relative">
            {src ? (
              <>
                <img src={src} alt={`Simulation ${index + 1}`} className="w-full rounded-lg shadow-md" />
                <Button variant="ghost" size="icon" className="absolute top-2 right-10 bg-white bg-opacity-50 hover:bg-opacity-75"><Download className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white bg-opacity-50 hover:bg-opacity-75">...</Button>
              </>
            ) : (
              <ImagePlaceholder />
            )}
          </div>
        ))}
      </div>
      <h3 className="font-semibold mb-2">目标收敛曲线图如下：</h3>
      {message.convergenceCurveUrl ? (
        <img src={message.convergenceCurveUrl} alt="Convergence Curve" className="w-full rounded-lg shadow-md" />
      ) : (
        <ImagePlaceholder />
      )}
    </div>
  </div>
);

const DesignOptimizationPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedFile) || isStreaming) return;

    let userMessageContent = inputValue;
    let fileUrl = null;

    setIsStreaming(true);

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
        const errorMessage = { role: 'ai', text: '抱歉，文件上传失败，请稍后再试。', simulationImages: [], convergenceCurveUrl: '' };
        setMessages(prev => [...prev, errorMessage]);
        setIsStreaming(false);
        return;
      }
    }

    const userMessage = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedFile(null);

    try {
      const response = await optimizeDesign(inputValue, fileUrl);
      const { text, simulationImages, convergenceCurveUrl } = response.data;
      const fullResponse = text.trim();

      const aiMessagePlaceholder = { 
        role: 'ai', 
        text: '', 
        simulationImages: Array(simulationImages.length).fill(null), 
        convergenceCurveUrl: null 
      };
      setMessages(prev => [...prev, aiMessagePlaceholder]);

      // 1. Stream text
      const streamText = (index) => {
        if (index >= fullResponse.length) {
          // 2. When text is done, start streaming images
          streamImages(0);
          return;
        }

        setMessages(prev => prev.map((msg, i) =>
          i === prev.length - 1
            ? { ...msg, text: (msg.text || '') + fullResponse[index] }
            : msg
        ));

        setTimeout(() => streamText(index + 1), 50);
      };

      // 2. Stream images
      const streamImages = (imgIndex) => {
        if (imgIndex >= simulationImages.length) {
          // 3. When simulation images are done, stream the curve
          streamCurve();
          return;
        }

        setTimeout(() => {
          setMessages(prev => prev.map((msg, i) => {
            if (i !== prev.length - 1) return msg;
            const newSimImages = [...msg.simulationImages];
            newSimImages[imgIndex] = simulationImages[imgIndex];
            return { ...msg, simulationImages: newSimImages };
          }));
          streamImages(imgIndex + 1);
        }, 1000); // Stagger image loading
      };
      
      // 3. Stream convergence curve
      const streamCurve = () => {
        setTimeout(() => {
          setMessages(prev => prev.map((msg, i) =>
            i === prev.length - 1
              ? { ...msg, convergenceCurveUrl: convergenceCurveUrl }
              : msg
          ));
          setIsStreaming(false);
        }, 1000);
      };

      streamText(0);

    } catch (error) {
      console.error("Failed to optimize design:", error);
      const errorMessage = { role: 'ai', text: '抱歉，优化时出现错误。', simulationImages: [], convergenceCurveUrl: '' };
      setMessages(prev => [...prev, errorMessage]);
      setIsStreaming(false);
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
