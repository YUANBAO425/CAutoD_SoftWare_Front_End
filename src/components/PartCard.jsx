import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { downloadFileAPI } from '@/api/fileAPI.js';
import useConversationStore from '@/store/conversationStore'; // 导入 useConversationStore

const PartCard = ({ part }) => {
  const { activeConversationId, activeTaskId } = useConversationStore(); // 从 store 获取 activeConversationId 和 activeTaskId

  const handleDownload = async () => {
    try {
      const fileName = part.fileName || part.name;
      // 使用从 store 获取的 activeTaskId 和 activeConversationId
      const response = await downloadFileAPI(activeTaskId, activeConversationId, fileName);

      // response 本身就是一个 Blob，不需要再次包装
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-2">
      {part.isLoading ? (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
          <div className="flex space-x-2">
            <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-gray-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      ) : (
        <img src={part.imageUrl} alt={part.name} className="w-full h-40 object-cover" />
      )}
      <div className="p-4 flex items-center justify-between">
        <span className="text-sm font-medium">{part.name}</span>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default PartCard;
