import React, { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { executeTaskAPI, submitOptimizationParamsAPI } from '@/api/taskAPI';
import { uploadFileAPI } from '@/api/fileAPI.js';
import { Upload } from 'lucide-react';
import useConversationStore from '@/store/conversationStore';
import ConversationDisplay from '@/components/ConversationDisplay.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Clock } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

const ConversationSelector = () => {
  const { conversations, activeConversationId, setActiveConversationId } = useConversationStore();

  if (conversations.length === 0) {
    return <p className="text-center text-gray-500">请先创建一个对话。</p>;
  }

  return (
    <div className="mb-4">
      <Select value={activeConversationId} onValueChange={setActiveConversationId}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="选择一个对话..." />
        </SelectTrigger>
        <SelectContent>
          {conversations.map(conv => (
            <SelectItem key={conv.conversation_id} value={conv.conversation_id}>
              {conv.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const WorkflowGuide = () => (
  <div className="text-left max-w-2xl mx-auto bg-green-50 p-4 rounded-lg border border-green-200 mb-8">
    <h2 className="text-lg font-semibold text-green-800 mb-2">第二步：设计优化</h2>
    <ol className="list-decimal list-inside text-gray-700 space-y-1">
      <li>请先在【几何建模】页面完成初始模型的设计和导出。</li>
      <li>上传您在 SolidWorks 中处理过的 <strong>.sldprt</strong> 文件。</li>
      <li>点击下方的“开始优化”按钮，系统将对上传的模型进行分析与优化。</li>
      <li>系统将执行优化，您可以根据结果进行多轮迭代，直到满意为止。</li>
    </ol>
  </div>
);

const FileUploadComponent = ({ onFileSelect, onStart, selectedFile, isStreaming, disabled }) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-xs mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".sldprt"
      />
      <Button onClick={handleButtonClick} disabled={disabled} variant="outline" className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {selectedFile ? `已选择: ${selectedFile.name}` : '选择 .sldprt 文件'}
      </Button>
      <Button onClick={onStart} disabled={!selectedFile || disabled} size="lg" className="w-full">
        开始优化
      </Button>
    </div>
  );
};

const ParameterForm = ({ params, onSubmit, isTaskRunning, isSecondRoundCompleted }) => {
  const [extendedParams, setExtendedParams] = useState([]);
  const [checkedParams, setCheckedParams] = useState({});
  const prevParamsRef = React.useRef();

  useEffect(() => {
    const stressParam = {
      name: 'permissible_stress',
      initialValue: 235,
      isStress: true,
    };
    const newParams = params.find(p => p.name === 'permissible_stress') ? params : [...params, stressParam];
    setExtendedParams(newParams);

    // Only reset checked state if the params have actually changed
    if (JSON.stringify(prevParamsRef.current) !== JSON.stringify(params)) {
      const initialChecked = {};
      newParams.forEach(param => {
        initialChecked[param.name] = true;
      });
      setCheckedParams(initialChecked);
    }
    prevParamsRef.current = params;
  }, [params]);

  const [ranges, setRanges] = useState({});

  useEffect(() => {
    const initialRanges = {};
    extendedParams.forEach(param => {
      initialRanges[param.name] = {
        min: param.min !== undefined && param.min !== null ? param.min : (param.initialValue !== undefined && param.initialValue !== null ? param.initialValue : ''),
        max: param.max !== undefined && param.max !== null ? param.max : (param.initialValue !== undefined && param.initialValue !== null ? param.initialValue : '')
      };
    });
    setRanges(initialRanges);
  }, [extendedParams]);

  const [submissionStatus, setSubmissionStatus] = useState('idle');

  const handleRangeChange = (paramName, bound, value) => {
    setRanges(prev => ({
      ...prev,
      [paramName]: { ...prev[paramName], [bound]: value }
    }));
  };

  const handleCheckboxChange = (paramName) => {
    setCheckedParams(prev => ({
      ...prev,
      [paramName]: !prev[paramName]
    }));
  };

  const handleSubmit = async () => {
    setSubmissionStatus('loading');
    const selectedRanges = {};
    for (const paramName in ranges) {
      if (checkedParams[paramName]) {
        selectedRanges[paramName] = ranges[paramName];
      }
    }

    try {
      await onSubmit(selectedRanges);
      setSubmissionStatus('success');
    } catch (error) {
      setSubmissionStatus('error');
    }
  };

  const isInputDisabled = submissionStatus === 'loading' || submissionStatus === 'success';

  return (
    <div className="w-full max-w-2xl mx-auto p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">设置参数范围</h3>
      <div className="grid grid-cols-[auto_2fr_1fr_1fr] gap-x-4 gap-y-2 mb-2 items-center">
        <div />
        <div className="text-sm font-medium text-gray-600">参数</div>
        <div className="text-center text-sm font-medium text-gray-600">下界</div>
        <div className="text-center text-sm font-medium text-gray-600">上界</div>
      </div>
      <div className="space-y-4">
        {extendedParams.map(param => (
          <div key={param.name} className="grid grid-cols-[auto_2fr_1fr_1fr] items-center gap-x-4">
            <Checkbox
              id={`check-${param.name}`}
              checked={!!checkedParams[param.name]}
              onCheckedChange={() => handleCheckboxChange(param.name)}
              disabled={isInputDisabled}
            />
            <label htmlFor={`check-${param.name}`} className="font-medium" title={param.name}>
              {param.name}
            </label>
            {param.isStress ? (
              <>
                <Input
                  type="number"
                  placeholder="最大值"
                  value={ranges[param.name]?.max}
                  onChange={e => handleRangeChange(param.name, 'max', e.target.value)}
                  disabled={isInputDisabled || !checkedParams[param.name]}
                  className="col-span-1"
                />
                <div /> 
              </>
            ) : (
              <>
                <Input
                  type="number"
                  placeholder="下界"
                  value={ranges[param.name]?.min}
                  onChange={e => handleRangeChange(param.name, 'min', e.target.value)}
                  disabled={isInputDisabled || !checkedParams[param.name]}
                />
                <Input
                  type="number"
                  placeholder="上界"
                  value={ranges[param.name]?.max}
                  onChange={e => handleRangeChange(param.name, 'max', e.target.value)}
                  disabled={isInputDisabled || !checkedParams[param.name]}
                />
              </>
            )}
          </div>
        ))}
      </div>
      <Button onClick={handleSubmit} disabled={isTaskRunning || params.length === 0 || isInputDisabled} className="w-full mt-6">
        提交范围并继续进行优化
      </Button>
    </div>
  );
};


const DesignOptimizationPage = () => {
  const {
    messages,
    addMessage,
    isLoadingMessages,
    activeConversationId,
    activeTaskId,
    createTask,
    updateLastAiMessage, // 使用新的统一 action
  } = useConversationStore();
  const [isTaskRunning, setIsTaskRunning] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [optimizableParams, setOptimizableParams] = useState([]);
  const [paramRanges, setParamRanges] = useState({});
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [isSecondRoundCompleted, setIsSecondRoundCompleted] = useState(false);
  const [isQueueDialogOpen, setIsQueueDialogOpen] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        const cleanedContent = lastMessage.content.replace(/[^\x00-\x7F\u4e00-\u9fa5\n\r\t\s\w\d\.\-\+\=\:\：]/g, '');
        const extractedParams = [];
        const paramRegex = /获取参数\d+[:：]\s*(.+?)：\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/g;
        let match;
        paramRegex.lastIndex = 0;
        while ((match = paramRegex.exec(cleanedContent)) !== null) {
          const paramName = match[1].trim();
          const minValue = parseFloat(match[2].trim());
          const maxValue = parseFloat(match[3].trim());
          if (!isNaN(minValue) && !isNaN(maxValue)) {
            extractedParams.push({
              name: paramName,
              initialValue: (minValue + maxValue) / 2,
              min: minValue,
              max: maxValue
            });
          } else {
            console.warn(`DesignOptimizationPage: Could not parse min/max values for param: ${paramName}, min: ${match[2]}, max: ${match[3]}`);
          }
        }
        if (extractedParams.length > 0) {
          setOptimizableParams(extractedParams);
        }
      }
    }
  }, [messages]);

  const handleParametersExtracted = useCallback((params) => {
    console.log("DesignOptimizationPage: Parameters extracted from AI message:", params);
    setOptimizableParams(params);
  }, []);

  const handleRangesSubmit = async (ranges) => {
    console.log("Submitted ranges:", ranges);
    setIsSecondRoundCompleted(false);

    try {
      await submitOptimizationParamsAPI({
        conversation_id: activeConversationId,
        task_id: activeTaskId,
        params: ranges,
      });
      setIsQueueDialogOpen(true); // Open the dialog on success
    } catch (error) {
      console.error("Failed to submit optimization parameters:", error);
      toast.error("提交参数失败，请重试。");
    }
  };

  const handleStartOptimization = async () => {
    if (!selectedFile || isTaskRunning || !activeConversationId) return;

    setIsTaskRunning(true); // 任务开始，设置为true
    setIsStreaming(true); // 开始流式传输
    const userMessageContent = `已上传文件进行优化: ${selectedFile.name}`;
    addMessage({ role: 'user', content: userMessageContent });
    addMessage({ role: 'assistant', content: '', task_type: 'optimize' }); // AI 回复占位符，并带上任务类型

    const taskType = 'optimize';
    const query = `请对上传的文件 ${selectedFile.name} 进行设计优化。`;
    let taskIdToUse = activeTaskId;

    // 1. 如果没有当前任务ID，则创建一个新任务
    try {
      if (!taskIdToUse) {
        const newTask = await createTask({
          conversation_id: activeConversationId,
          task_type: taskType,
          details: { query: query, fileName: selectedFile?.name }
        });
        if (!newTask) throw new Error("Task creation failed");
        taskIdToUse = newTask.task_id;
      }
    } catch (error) {
        console.error("Failed to create task:", error);
        updateLastAiMessage({
            finalData: { answer: "抱歉，创建任务时出现错误。", metadata: {} },
        });
        setIsTaskRunning(false); // 任务失败，设置为false
        setIsStreaming(false);
        return;
    }

    // 2. 上传文件，并附带会话和任务ID
    let fileUrl = null;
    try {
      const uploadResponse = await uploadFileAPI(selectedFile, activeConversationId, taskIdToUse);
      if (uploadResponse && uploadResponse.path) {
        fileUrl = uploadResponse.path;
        setUploadedFileUrl(fileUrl); // 保存上传文件的URL
      } else {
        throw new Error('File upload failed: Invalid response from server');
      }
    } catch (error) {
      console.error("File upload failed:", error);
      updateLastAiMessage({
        finalData: { answer: "抱歉，文件上传失败。", metadata: {} },
      });
      setIsStreaming(false);
      return;
    }
    
    // 3. 执行任务
    try {
      const requestData = {
        task_type: taskType,
        query: query,
        file_url: fileUrl,
        conversation_id: activeConversationId,
        task_id: taskIdToUse,
      };

      executeTaskAPI({
        ...requestData,
        response_mode: "streaming",
        onMessage: {
          text_chunk: (data) => {
            updateLastAiMessage({ textChunk: data.text });
          },
          image_chunk: (data) => {
            updateLastAiMessage({ image: data });
          },
          message_end: (data) => {
            updateLastAiMessage({ finalData: data });
            setIsStreaming(false); // 流式传输结束
            // 在消息结束时提取参数
            if (data.answer && data.metadata && data.metadata.cad_file === "model.step" && data.metadata.code_file === "script.py") {
              console.log("DesignOptimizationPage: message_end received. Full answer content (raw):", JSON.stringify(data.answer)); // 打印完整答案内容（原始字符串）
              console.log("DesignOptimizationPage: message_end received. Full answer content (parsed):", data.answer); // 打印完整答案内容（已解析）

              // 硬编码测试字符串，用于验证正则表达式
              const testString = "获取参数0：Bottom_main_tube_thick = 0.015\n获取参数1: Uper_main_tube_thick = 0.015";
              const testRegex = /获取参数\d+[:：] (.+?) = (.+)/g;
              let testMatch;
              testRegex.lastIndex = 0;
              while ((testMatch = testRegex.exec(testString)) !== null) {
                console.log("DesignOptimizationPage: Test regex match:", testMatch);
              }

              // 清理 data.answer，移除可能存在的不可见字符
              const cleanedAnswer = data.answer.replace(/[^\x00-\x7F\u4e00-\u9fa5\n\r\t\s\w\d\.\-\+\=\:\：]/g, ''); // 保留ASCII字符、中文、换行符、制表符、空格、单词字符、数字、点、连字符、加号、等号、冒号
              console.log("DesignOptimizationPage: Cleaned answer content (raw):", JSON.stringify(cleanedAnswer));
              console.log("DesignOptimizationPage: Cleaned answer content (parsed):", cleanedAnswer);
              // 打印 cleanedAnswer 中每个字符的 Unicode 编码
              console.log("DesignOptimizationPage: Cleaned answer char codes:");
              for (let i = 0; i < cleanedAnswer.length; i++) {
                console.log(`Char: '${cleanedAnswer[i]}', Code: ${cleanedAnswer.charCodeAt(i)}`);
              }

              const extractedParams = [];
              const paramRegex = /获取参数\d+[:：]\s*(.+?)：\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/g;
              let match;
              paramRegex.lastIndex = 0;
              while ((match = paramRegex.exec(cleanedAnswer)) !== null) {
                console.log("DesignOptimizationPage: Param regex match (from cleanedAnswer):", match);
                const paramName = match[1].trim();
                const minValue = parseFloat(match[2].trim());
                const maxValue = parseFloat(match[3].trim());
                if (!isNaN(minValue) && !isNaN(maxValue)) {
                  extractedParams.push({
                    name: paramName,
                    initialValue: (minValue + maxValue) / 2, // 可以设置一个中间值作为初始值
                    min: minValue,
                    max: maxValue
                  });
                } else {
                  console.warn(`DesignOptimizationPage: Could not parse min/max values for param: ${paramName}, min: ${match[2]}, max: ${match[3]}`);
                }
              }
              console.log("DesignOptimizationPage: Extracted parameters at message_end:", extractedParams);
              if (extractedParams.length > 0) {
                handleParametersExtracted(extractedParams);
              } else {
                console.log("DesignOptimizationPage: No optimizable parameters found in final answer content.");
              }
            }
          },
        },
        onError: (error) => {
          console.error("SSE error:", error);
          updateLastAiMessage({
            finalData: {
              answer: "抱歉，请求出错，请稍后再试。",
              metadata: {},
            },
          });
          setIsTaskRunning(false); // 任务失败，设置为false
          setIsStreaming(false);
        },
        onClose: () => {
          setIsTaskRunning(false); // 任务完成，设置为false
          setIsStreaming(false);
        },
      });

    } catch (error) {
      console.error("Failed to start optimization task:", error);
      updateLastAiMessage({
        finalData: {
          answer: "抱歉，启动优化任务时出现错误。",
          metadata: {},
        },
      });
      setIsTaskRunning(false); // 任务失败，设置为false
      setIsStreaming(false);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white pb-40">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-8">上传文件以开始优化</h1>
          <WorkflowGuide />
          <ConversationSelector />
          <FileUploadComponent
            onFileSelect={setSelectedFile}
            onStart={handleStartOptimization}
            selectedFile={selectedFile}
            isStreaming={isStreaming}
            disabled={!activeConversationId || isTaskRunning}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <PanelGroup direction="vertical" className="flex flex-col h-full bg-white">
        <Panel>
          <ConversationDisplay 
            messages={messages} 
            isLoading={isLoadingMessages}
            onParametersExtracted={handleParametersExtracted} 
          />
        </Panel>
        <PanelResizeHandle className="h-2 bg-gray-200 hover:bg-gray-300 transition-colors" />
        <Panel
          collapsible={true}
          defaultSize={optimizableParams.length > 0 ? 50 : 20}
          minSize={10}
        >
          <div className="p-4 border-t bg-gray-50 h-full overflow-y-auto">
            {optimizableParams.length > 0 ? (
              <ParameterForm 
                params={optimizableParams}
                onSubmit={handleRangesSubmit}
                isStreaming={isStreaming}
                isSecondRoundCompleted={isSecondRoundCompleted}
              />
            ) : (
              <FileUploadComponent
                onFileSelect={setSelectedFile}
                onStart={handleStartOptimization}
                selectedFile={selectedFile}
                isStreaming={isStreaming}
                disabled={!activeConversationId || isTaskRunning}
              />
            )}
          </div>
        </Panel>
      </PanelGroup>

      <Dialog open={isQueueDialogOpen} onOpenChange={setIsQueueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              参数已提交
            </DialogTitle>
            <DialogDescription>
              您的参数已成功提交，优化任务已进入后台队列处理。请耐心等待最终结果。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsQueueDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DesignOptimizationPage;
