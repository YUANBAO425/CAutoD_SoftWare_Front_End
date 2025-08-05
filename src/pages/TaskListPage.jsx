import React, { useEffect } from 'react';
import useConversationStore from '../store/conversationStore';
import useUserStore from '../store/userStore';

const TaskListPage = () => {
  const { tasks, fetchTasks, isLoadingTasks } = useConversationStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (user?.user_id) {
      fetchTasks(user.user_id);
    }
  }, [user, fetchTasks]);

  if (isLoadingTasks) {
    return <div>正在加载任务列表...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">任务历史记录</h1>
      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li key={task.task_id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
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
