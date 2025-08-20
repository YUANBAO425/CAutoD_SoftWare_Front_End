import React, { useState } from 'react';
import useConversationStore from '@/store/conversationStore'; // 导入 store
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import PartCard from './PartCard'; // 导入 PartCard
import ProtectedImage from './ProtectedImage'; // 导入 ProtectedImage 组件
import { Button } from './ui/button';
import { Download, Code, Image as ImageIcon, Clipboard } from 'lucide-react';
import { downloadFileAPI } from '@/api/fileAPI'; // 导入下载API
import ReactMarkdown from 'react-markdown'; // 导入 ReactMarkdown
import rehypeRaw from 'rehype-raw'; // 导入 rehype-raw
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // 导入高亮组件
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // 导入深色主题

const UserMessage = ({ content }) => (
  <div className="flex justify-end my-4">
    <div className="bg-purple-600 text-white rounded-lg p-3 max-w-lg break-words">
      {content}
    </div>
  </div>
);

const CodeBlock = ({ language, children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const textToCopy = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 p-1 rounded-md bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {isCopied ? (
          <span className="text-xs px-1">Copied!</span>
        ) : (
          <Clipboard className="h-4 w-4" />
        )}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
      >
        {textToCopy}
      </SyntaxHighlighter>
    </div>
  );
};

const OptimizationLogRenderer = ({ content }) => {
  const parseLog = (logContent) => {
    if (!logContent) return [];
    const blocks = logContent.split(/(?=开始优化|发送参数|优化完成|优化结果详细信息)/).filter(Boolean);

    return blocks.map((block, index) => {
      if (block.includes('仿真执行失败') || block.includes('仿真评估错误')) {
        return { type: 'ERROR', content: block, id: `error-${index}` };
      }
      if (block.startsWith('开始优化')) {
        return { type: 'START', content: block, id: `start-${index}` };
      }
      if (block.startsWith('发送参数')) {
        const titleMatch = block.match(/发送参数 \((.+?)\)/);
        return { type: 'ITERATION', title: titleMatch ? titleMatch[1] : '迭代', content: block, id: `iter-${index}` };
      }
      if (block.startsWith('优化完成')) {
        return { type: 'END', content: block, id: `end-${index}` };
      }
      if (block.startsWith('优化结果详细信息')) {
        return { type: 'RESULT', content: block, id: `result-${index}` };
      }
      // Default block for initial info
      return { type: 'INFO', content: block, id: `info-${index}` };
    });
  };

  const logEvents = parseLog(content);

  return (
    <div className="space-y-4">
      {logEvents.map(event => {
        const isError = event.type === 'ERROR';
        return (
          <Card key={event.id} className={isError ? 'border-red-500' : ''}>
            <CardHeader>
              <CardTitle className={isError ? 'text-red-500' : ''}>
                {event.type === 'ITERATION' && `迭代详情 (${event.title})`}
                {event.type === 'ERROR' && '错误'}
                {event.type === 'START' && '开始优化'}
                {event.type === 'END' && '优化完成'}
                {event.type === 'RESULT' && '最终结果'}
                {event.type === 'INFO' && '初始化信息'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md">
                <code>{event.content.trim()}</code>
              </pre>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};


const AiMessage = ({ message }) => {
  const { content, parts, metadata } = message;

  const partsToRender = parts?.filter(p => p.type === 'part') || [];
  const imagesToDisplay = parts?.filter(p => p.type === 'image') || [];

  // Use the new task_type property for a reliable check
  const isOptimizationLog = message.task_type === 'optimize';

  const handleDownload = async (fileName) => {
    if (!fileName) return;
    try {
      const response = await downloadFileAPI(fileName);
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="flex items-start my-4">
      <Avatar className="mr-4">
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-lg p-3 w-full max-w-4xl">
        {isOptimizationLog ? (
          <OptimizationLogRenderer content={content} />
        ) : (
          <div className="prose max-w-none break-words">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <CodeBlock language={match[1]} {...props}>
                      {children}
                    </CodeBlock>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {imagesToDisplay && imagesToDisplay.length > 0 && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {imagesToDisplay.map((image, idx) => (
              <div key={idx} className="border rounded-lg p-2">
                <ProtectedImage 
                  src={image.imageUrl.startsWith('http://') || image.imageUrl.startsWith('https://') 
                    ? image.imageUrl 
                    : `http://127.0.0.1:8080${image.imageUrl}`}
                  alt={image.altText || 'Generated image'} 
                  className="w-full h-auto rounded cursor-pointer"
                  onClick={() => handleDownload(image.fileName)}
                />
                <p className="text-sm text-center mt-1">{image.altText || image.fileName}</p>
              </div>
            ))}
          </div>
        )}

        {partsToRender && partsToRender.length > 0 && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {partsToRender.map((part, idx) => (
                <PartCard key={idx} part={part} />
              ))}
          </div>
        )}

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
              {!isOptimizationLog && (
                <Button variant="outline" size="sm" onClick={() => handleDownload(metadata.code_file)}>
                    <Code className="mr-2 h-4 w-4" /> 下载建模代码
                </Button>
              )}
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
