import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, ArrowUp, Download, Share2, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { submitDesignRequest } from '@/api/geometricModelingAPI';
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

const AiMessage = ({ content }) => (
  <div className="flex items-start my-4">
    <Avatar className="mr-4">
      <AvatarFallback>O</AvatarFallback>
    </Avatar>
    <div className="bg-gray-100 rounded-lg p-4 max-w-2xl prose">
      <ReactMarkdown>{content}</ReactMarkdown>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">机械臂.step</span>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon"><Code className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  </div>
);


const GeometricModelingPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { role: 'user', content: inputValue }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await submitDesignRequest(inputValue);
      setMessages([...newMessages, { role: 'ai', content: data.data.response }]);
    } catch (error) {
      console.error("Failed to fetch design request:", error);
      setMessages([...newMessages, { role: 'ai', content: '抱歉，我暂时无法回答您的问题。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始视图
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">您的设计需求是？</h1>
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="设计一个机械臂？"
              className="w-full p-6 rounded-full border-gray-300"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <div className="absolute right-4 flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5 text-gray-500" />
              </Button>
              <Button size="icon" className="bg-pink-500 hover:bg-pink-600 rounded-md" onClick={handleSendMessage} disabled={isLoading}>
                <ArrowUp className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
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
            : <AiMessage key={index} content={msg.content} />
        ))}
        {isLoading && <AiMessage content="正在思考中..." />}
      </div>
      <div className="mt-auto">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="设计优化"
            className="w-full p-6 rounded-lg border-gray-300"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <div className="absolute right-4 flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <Button size="icon" className="bg-pink-500 hover:bg-pink-600 rounded-md" onClick={handleSendMessage} disabled={isLoading}>
              <ArrowUp className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeometricModelingPage;
