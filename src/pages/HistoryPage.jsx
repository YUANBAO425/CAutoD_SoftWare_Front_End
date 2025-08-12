import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react';
import useConversationStore from '../store/conversationStore';
import { getConversationDetailsAPI } from '../api/conversationAPI';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

const TaskItem = ({ task }) => (
  <div className="pl-10 pr-4 py-2 bg-gray-50 border-t">
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium text-sm">{task.task_type}</p>
        <p className="text-xs text-gray-500">任务ID: {task.task_id}</p>
        {/* <p className="text-xs text-gray-500">{task.summary}</p> */}
      </div>
      <div className="text-right">
        <p className={`text-xs font-semibold ${task.status === '完成' ? 'text-green-600' : 'text-yellow-600'}`}>{task.status}</p>
        <p className="text-xs text-gray-400">{new Date(task.created_at).toLocaleTimeString()}</p>
      </div>
    </div>
  </div>
);

const HistoryItem = ({ item, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const handleToggle = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && tasks.length === 0) {
      setIsLoadingTasks(true);
      try {
        const conversationDetails = await getConversationDetailsAPI(item.conversation_id);
        // The backend returns the conversation object which should contain a list of tasks.
        // We assume the tasks are in a property named 'tasks'.
        setTasks(conversationDetails.tasks || []);
      } catch (error) {
        console.error("Failed to fetch conversation details:", error);
        setTasks([]); // On error, set tasks to an empty array
      } finally {
        setIsLoadingTasks(false);
      }
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer" onClick={handleToggle}>
        <div className="flex items-center">
          {isOpen ? <ChevronDown className="h-5 w-5 mr-3" /> : <ChevronRight className="h-5 w-5 mr-3" />}
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(item.conversation_id); }}>
          <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500" />
        </Button>
      </div>
      {isOpen && (
        <div>
          {isLoadingTasks ? (
            <p className="p-4 text-center text-gray-500">加载任务中...</p>
          ) : tasks.length > 0 ? (
            tasks.map(task => <TaskItem key={task.task_id} task={task} />)
          ) : (
            <p className="p-4 text-center text-gray-500">该对话下没有任务。</p>
          )}
        </div>
      )}
    </div>
  );
};

const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { conversations, isLoading, error, deleteConversation } = useConversationStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);


  const openDeleteDialog = (conversationId) => {
    setSelectedConversationId(conversationId);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedConversationId) {
      deleteConversation(selectedConversationId);
    }
    setIsDialogOpen(false);
    setSelectedConversationId(null);
  };

  const filteredHistory = (conversations || []).filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">加载历史记录失败。</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-pink-600">历史记录</h1>
      
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="搜索历史对话..."
          className="w-full p-6 rounded-full border-gray-300 pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">所有对话</h2>
        <Button variant="link" className="text-gray-600">选择全部</Button>
      </div>

      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map(item => (
            <HistoryItem key={item.conversation_id} item={item} onDelete={() => openDeleteDialog(item.conversation_id)} />
          ))
        ) : (
          <p className="text-center text-gray-500">没有找到匹配的对话。</p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              此操作将永久删除该会话及其包含的所有任务和消息历史。此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryPage;
