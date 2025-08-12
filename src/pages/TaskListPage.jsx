import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useConversationStore from '../store/conversationStore';
import useUserStore from '../store/userStore';
import { deleteTaskAndMessagesAPI, deleteHistoryAPI } from '../api/conversationAPI';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const TaskListPage = () => {
  const { tasks, fetchTasks, isLoadingTasks, fetchMessagesForTask, removeTask, updateTask } = useConversationStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.user_id) {
      fetchTasks(user.user_id);
    }
  }, [user, fetchTasks]);

  if (isLoadingTasks) {
    return <div>正在加载任务列表...</div>;
  }

  const handleTaskClick = async (task) => {
    console.log('Clicked Task:', task); // 添加调试日志
    await fetchMessagesForTask(task.task_id, task.conversation_id);
    
    // 根据任务类型跳转到对应的页面
    switch (task.task_type) {
      case 'geometry':
        navigate('/geometry');
        break;
      case 'retrieval':
        navigate('/parts');
        break;
      case 'optimize': // 修正 task_type 的值
        navigate('/design-optimization');
        break;
      default:
        // 如果有其他或未知的任务类型，可以跳转到一个默认页面或不跳转
        console.warn(`Unknown task type: ${task.task_type}, navigating to default.`);
        navigate('/parts'); // 默认为零件检索
        break;
    }
  };

  const openDeleteDialog = (task, e) => {
    e.stopPropagation(); // 防止触发 handleTaskClick
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTaskAndMessages = async () => {
    if (!selectedTask) return;
    try {
      await deleteTaskAndMessagesAPI(selectedTask.task_id);
      removeTask(selectedTask.task_id);
      setIsDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task and messages:", error);
      // TODO: Add user-facing error notification
    }
  };

  const handleDeleteHistoryOnly = async () => {
    if (!selectedTask) return;
    try {
      await deleteHistoryAPI(selectedTask.task_id);
      // 直接更新本地状态以获得即时反馈
      updateTask(selectedTask.task_id, { 
        last_message: "对话历史已清除",
        last_time: new Date().toLocaleString() // 使用当前时间更新
      });
      setIsDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete history:", error);
      // TODO: Add user-facing error notification
    }
  };

  return (
    <>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">任务历史记录</h1>
      <div className="bg-white shadow-md rounded-lg max-w-5xl mx-auto">
        <ul className="divide-y divide-gray-200">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li 
                key={task.task_id} 
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.last_message || '暂无消息'}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-4">任务ID: {task.task_id}</span>
                    <span>类型: {task.task_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">{task.last_time}</p>
                  <Button
                    variant="ghost"
                      size="icon"
                      onClick={(e) => openDeleteDialog(task, e)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">没有找到任何历史记录。</li>
          )}
        </ul>
      </div>
    </div>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              请选择您要执行的删除操作。此操作不可逆。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-col sm:space-x-0 gap-2">
            <Button
              variant="destructive"
              onClick={handleDeleteTaskAndMessages}
            >
              删除任务及所有对话
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteHistoryOnly}
            >
              仅删除对话 (任务将保留)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskListPage;
