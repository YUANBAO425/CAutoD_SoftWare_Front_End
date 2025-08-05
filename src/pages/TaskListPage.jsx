import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useConversationStore from '../store/conversationStore';
import useUserStore from '../store/userStore';

const TaskListPage = () => {
  const { tasks, fetchTasks, isLoadingTasks, fetchMessagesForTask } = useConversationStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

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

  return (
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
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{task.last_time}</p>
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
  );
};

export default TaskListPage;
