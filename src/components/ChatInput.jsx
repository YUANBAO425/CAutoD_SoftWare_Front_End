import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paperclip, ArrowUp, X, File as FileIcon } from 'lucide-react';

const ChatInput = ({ 
  inputValue, 
  onInputChange, 
  onSendMessage, 
  isStreaming, 
  placeholder,
  selectedFile,
  onFileSelect,
  isInitialView = false,
  disabled = false // Accept a disabled prop
}) => {

  const handleAttachmentClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        onFileSelect(file);
      }
    };
    fileInput.click();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isStreaming) {
      onSendMessage();
    }
  };

  return (
    <div>
      {selectedFile && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md mb-2">
          <div className="flex items-center">
            <FileIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onFileSelect(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder={placeholder}
          className={`w-full p-6 border-gray-300 ${isInitialView ? 'rounded-full' : 'rounded-lg'}`}
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
          disabled={isStreaming || disabled}
        />
        <div className="absolute right-4 flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleAttachmentClick} disabled={disabled || isStreaming}>
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          <Button 
            size="icon" 
            className="bg-pink-500 hover:bg-pink-600 rounded-md" 
            onClick={() => {
              console.log("ChatInput: Send button clicked.");
              onSendMessage();
            }} 
            disabled={isStreaming || (!inputValue.trim() && !selectedFile) || disabled}
          >
            <ArrowUp className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
