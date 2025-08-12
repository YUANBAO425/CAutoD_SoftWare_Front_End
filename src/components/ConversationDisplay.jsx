import React from 'react';
import useConversationStore from '@/store/conversationStore'; // 导入 store
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PartCard from './PartCard'; // 导入 PartCard
import ProtectedImage from './ProtectedImage'; // 导入 ProtectedImage 组件
import { Button } from './ui/button';
import { Download, Code, Image as ImageIcon } from 'lucide-react';
import { downloadFileAPI } from '@/api/fileAPI'; // 导入下载API

const UserMessage = ({ content }) => (
  <div className="flex justify-end my-4">
    <div className="bg-purple-600 text-white rounded-lg p-3 max-w-lg break-words">
      {content}
    </div>
  </div>
);

const AiMessage = ({ message }) => {
  const { content, parts, metadata } = message;

  // 图片数据现在直接来源于 message.parts
  const imagesToDisplay = parts?.filter(p => p.type === 'image') || [];

  const handleDownload = async (fileName) => {
    if (!fileName) return;
    try {
      const response = await downloadFileAPI(fileName);
      console.log('Download Blob Type:', response.type); // Debug log
      console.log('Download Filename:', fileName); // Debug log
      
      // 创建一个 Blob URL 并触发下载
      // response 本身就是一个 Blob，不需要再次包装
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); // 清理
    } catch (error) {
      console.error("Download failed:", error);
      // TODO: 添加面向用户的错误提示
    }
  };

  return (
    <div className="flex items-start my-4">
      <Avatar className="mr-4">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-lg p-3 w-3/4"> {/* 修改宽度为 3/4 */}
        {/* 渲染文本内容 */}
        <div className="break-words">{content}</div>

        {/* 渲染图片 */}
        {imagesToDisplay && imagesToDisplay.length > 0 && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {imagesToDisplay.map((image, idx) => (
              <div key={idx} className="border rounded-lg p-2">
                <ProtectedImage 
                  src={`http://127.0.0.1:8080${image.imageUrl}`}
                  alt={image.altText || 'Generated image'} 
                  className="w-full h-auto rounded cursor-pointer"
                  onClick={() => handleDownload(image.fileName)}
                />
                <p className="text-sm text-center mt-1">{image.altText || image.fileName}</p>
              </div>
            ))}
          </div>
        )}

        {/* 渲染零件卡片 (过滤掉已通过 image 状态渲染的图片) */}
        {parts && parts.length > 0 && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {parts
              .filter((part) => part.type !== 'image')
              .map((part, idx) => (
                <PartCard key={idx} part={part} />
              ))}
          </div>
        )}

        {/* 渲染元数据 */}
        {metadata && (
          <div className="mt-4 border-t pt-2">
            <h4 className="text-sm font-semibold mb-2">生成文件:</h4>
            <div className="flex flex-col space-y-2">
               <Button variant="outline" size="sm" onClick={() => handleDownload(metadata.preview_image)}>
                  <ImageIcon className="mr-2 h-4 w-4" /> 预览图
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload(metadata.cad_file)}>
                  <Download className="mr-2 h-4 w-4" /> 下载CAD模型
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload(metadata.code_file)}>
                  <Code className="mr-2 h-4 w-4" /> 下载建模代码
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
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserMessage key={msg.id || msg.timestamp} content={msg.content} />
        ) : (
          <AiMessage key={msg.id || msg.timestamp} message={msg} />
        )
      )}
    </div>
  );
};

export default ConversationDisplay;
