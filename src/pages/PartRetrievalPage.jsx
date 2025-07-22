import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Download, Share2, Paperclip, ArrowUp } from 'lucide-react';
import { retrieveParts } from '@/api/partRetrievalAPI';

const UserMessage = ({ content }) => (
  <div className="flex justify-end my-4">
    <div className="bg-purple-600 text-white rounded-lg p-3 max-w-lg">
      {content}
    </div>
  </div>
);

const PartCard = ({ part }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <img src={part.imageUrl} alt={part.name} className="w-full h-40 object-cover" />
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

const PartRetrievalPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await retrieveParts(inputValue);
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
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].parts.push(allParts[index]);
          return newMessages;
        });

        setTimeout(() => streamParts(index + 1), 500); // 控制卡片出现速度
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
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="例如：一个高强度的机械臂爪"
              className="w-full p-6 rounded-full border-gray-300 bg-white"
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
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="继续提问或优化..."
            className="w-full p-6 rounded-lg border-gray-300 bg-white"
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

export default PartRetrievalPage;
