import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getPendingTasksAPI } from '@/api/taskAPI';
import { Clock, Loader2, MessageSquare, Search, Settings2 } from 'lucide-react';
import { format } from 'date-fns';

const taskIcons = {
  geometry: <MessageSquare className="h-5 w-5 text-blue-500" />,
  part_retrieval: <Search className="h-5 w-5 text-green-500" />,
  design_optimization: <Settings2 className="h-5 w-5 text-purple-500" />,
  default: <Clock className="h-5 w-5 text-gray-500" />,
};

const getTaskIcon = (taskType) => {
  return taskIcons[taskType] || taskIcons.default;
};

const TaskItem = ({ task }) => (
  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
    {/* Column 1: Icon */}
    <div>
      {getTaskIcon(task.task_type)}
    </div>
    {/* Column 2: Title and ID (takes up remaining space) */}
    <div className="min-w-0">
      <p className="font-semibold text-sm truncate">{task.conversation_title}</p>
      <p className="text-xs text-gray-500">
        ID: {task.task_id}
      </p>
    </div>
    {/* Column 3: Time and Type */}
    <div className="text-right">
      <p className="text-xs font-medium text-gray-700 whitespace-nowrap">{format(new Date(task.created_at), 'HH:mm:ss')}</p>
      <p className="text-xs text-gray-400 capitalize">{task.task_type.replace('_', ' ')}</p>
    </div>
  </div>
);

const TaskQueue = ({ isOpen, onOpenChange }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const pendingTasks = await getPendingTasksAPI();
        setTasks(pendingTasks);
      } catch (error) {
        console.error("Failed to fetch pending tasks:", error);
        // Optionally, show an error message in the dialog
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks(); // Initial fetch
    const intervalId = setInterval(fetchTasks, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount or when dialog closes
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            任务队列
          </DialogTitle>
          <DialogDescription>
            以下是当前正在等待处理的任务，按提交顺序排列。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
          {isLoading && tasks.length === 0 ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : tasks.length > 0 ? (
            tasks.map(task => <TaskItem key={task.task_id} task={task} />)
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p>当前没有等待中的任务。</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskQueue;
