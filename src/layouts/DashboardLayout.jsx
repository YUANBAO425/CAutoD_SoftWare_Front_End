import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Bell, ChevronDown, Plus, MessageSquare, Search, Settings2, Code, User, Clock, ListChecks } from 'lucide-react';
import useUserStore from '../store/userStore';
import TaskQueue from '@/components/TaskQueue';
import useConversationStore from '../store/conversationStore';

const NavItem = ({ to, icon: Icon, text, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center p-2 rounded-lg ${
        isActive ? 'bg-pink-600 text-white' : 'hover:bg-blue-800'
      }`
    }
  >
    <Icon className="mr-3 h-5 w-5" /> {text}
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useUserStore();
  const { conversations, activeConversationId, setActiveConversationId, startNewConversation } = useConversationStore();

  // 智能排序，确保激活的会话始终可见
  const getDisplayConversations = () => {
    if (!conversations || conversations.length === 0) return [];
    const activeConv = conversations.find(c => c.conversation_id === activeConversationId);
    const otherConvs = conversations.filter(c => c.conversation_id !== activeConversationId);
    return activeConv ? [activeConv, ...otherConvs] : conversations;
  };
  const displayConversations = getDisplayConversations();

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col p-4">
      <div className="text-2xl font-bold mb-10">CAutoD</div>
      <NavItem to="/create-project" icon={Plus} text="创建项目" />
      <nav className="mt-6 flex-1">
        <NavItem to="/geometry" icon={MessageSquare} text="几何建模" onClick={startNewConversation} />
        <NavItem to="/parts" icon={Search} text="零件检索" onClick={startNewConversation} />
        <NavItem to="/design-optimization" icon={Settings2} text="设计优化" onClick={startNewConversation} />
        <NavItem to="/software-interface" icon={Code} text="软件界面" onClick={startNewConversation} />
        <NavItem to="/tasks" icon={ListChecks} text="任务列表" onClick={() => setActiveConversationId(null)} />
      </nav>
      <div className="mt-auto">
        <div className="mb-4">
          <h3 className="text-sm text-gray-400 mb-2 px-2">历史记录</h3>
          {displayConversations.length > 0 ? (
            <>
              {displayConversations.slice(0, 3).map(item => (
                <button 
                  key={item.conversation_id} 
                  onClick={() => setActiveConversationId(item.conversation_id)}
                  className={`block w-full text-left p-2 rounded-lg text-sm truncate ${
                    item.conversation_id === activeConversationId ? 'bg-pink-600' : 'hover:bg-blue-800'
                  }`}
                >
                  {item.title}
                </button>
              ))}
              {conversations.length > 3 && (
                <div className="px-2 text-gray-400">...</div>
              )}
            </>
          ) : (
            <p className="px-2 text-sm text-gray-400">暂无记录</p>
          )}
          <NavLink to="/history" className="block p-2 rounded-lg hover:bg-blue-800 text-sm text-gray-400">View all</NavLink>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center p-2 rounded-lg hover:bg-blue-800 cursor-pointer">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback>{user?.username?.[0].toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{user?.username || '用户'}</span>
              <ChevronDown className="h-5 w-5" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">用户信息</p>
                <p className="text-xs leading-none text-muted-foreground">
                  昵称: {user?.username || 'N/A'}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  邮箱: {user?.email || 'N/A'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  注册于: {formatDate(user?.created_at)}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>登出</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const Header = ({ onLogout, onToggleTaskQueue }) => {
  return (
    <header className="flex items-center justify-end p-3 bg-white border-b">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onToggleTaskQueue}>
          <Clock className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> 登出
        </Button>
      </div>
    </header>
  );
};

const DashboardLayout = () => {
  const { user, token, logout } = useUserStore(); // 确保 token 也被解构出来
  const { fetchConversations, addConversation } = useConversationStore();
  const location = useLocation();
  const [isTaskQueueOpen, setIsTaskQueueOpen] = useState(false);
  const isFlushPage = ['/geometry', '/parts', '/design-optimization', '/software-interface'].includes(location.pathname);

  useEffect(() => {
    if (user && user.user_id) {
      fetchConversations(user.user_id);
    }
  }, [user, fetchConversations]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onLogout={logout} onToggleTaskQueue={() => setIsTaskQueueOpen(true)} />
        <main className={`flex-1 overflow-y-auto ${isFlushPage ? '' : 'p-8'}`}>
          <Outlet context={{ fetchHistory: fetchConversations, addConversation }} />
        </main>
      </div>
      <TaskQueue isOpen={isTaskQueueOpen} onOpenChange={setIsTaskQueueOpen} />
    </div>
  );
};

export default DashboardLayout;
