import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PartCard from './PartCard'; // 导入 PartCard
import { Button } from './ui/button';
import { Download, Code, Image as ImageIcon } from 'lucide-react';

const UserMessage = ({ content }) => (
  <div className="flex justify-end my-4">
    <div className="bg-purple-600 text-white rounded-lg p-3 max-w-lg break-words">
      {content}
    </div>
  </div>
);

const AiMessage = ({ message }) => {
  const { content, parts, metadata } = message;

  return (
    <div className="flex items-start my-4">
      <Avatar className="mr-4">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-lg p-3 max-w-lg w-full">
        {/* 渲染文本内容 */}
        <div className="break-words">{content}</div>

        {/* 渲染零件卡片 */}
        {parts && parts.length > 0 && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {message.parts.map((part, idx) => (
              <PartCard key={idx} part={part} />
            ))}
          </div>
        )}

        {/* 渲染元数据 */}
        {message.metadata && (
          <div className="mt-4 border-t pt-2">
            <h4 className="text-sm font-semibold mb-2">生成文件:</h4>
            <div className="flex flex-col space-y-2">
               <Button variant="outline" size="sm" asChild>
                <a href={message.metadata.preview_image} target="_blank" rel="noopener noreferrer">
                  <ImageIcon className="mr-2 h-4 w-4" /> 预览图
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={message.metadata.cad_file} download>
                  <Download className="mr-2 h-4 w-4" /> 下载CAD模型
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={message.metadata.code_file} download>
                  <Code className="mr-2 h-4 w-4" /> 下载建模代码
                </a>
              </Button>
            </div>
          </div>
        )}
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
          <AiMessage key={index} message={msg} />
        )
      )}
    </div>
  );
};

export default ConversationDisplay;
