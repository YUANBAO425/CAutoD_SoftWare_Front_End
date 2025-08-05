import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const UserMessage = ({ content }) => (
  <div className="flex justify-end my-4">
    <div className="bg-purple-600 text-white rounded-lg p-3 max-w-lg">
      {content}
    </div>
  </div>
);

const AiMessage = ({ content }) => {
  const parseContent = (rawContent) => {
    if (typeof rawContent !== 'string') return '无效内容';
    try {
      if (rawContent.startsWith('event: message_end')) {
        const jsonStr = rawContent.split('data: ')[1].trim();
        const data = JSON.parse(jsonStr);
        return data.answer || '无法解析回复';
      }
      const data = JSON.parse(rawContent);
      return data.answer || '无法解析回复';
    } catch (e) {
      return rawContent;
    }
  };

  const displayContent = parseContent(content);

  return (
    <div className="flex items-start my-4">
      <Avatar className="mr-4">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-lg p-3 max-w-lg">
        {displayContent}
      </div>
    </div>
  );
};

const ConversationDisplay = ({ messages, isLoading }) => {
  if (isLoading) {
    return <div className="flex items-center justify-center h-full">正在加载对话记录...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {messages.map((msg, index) =>
        msg.role === 'user' ? (
          <UserMessage key={index} content={msg.content} />
        ) : (
          <AiMessage key={index} content={msg.content} />
        )
      )}
    </div>
  );
};

export default ConversationDisplay;
