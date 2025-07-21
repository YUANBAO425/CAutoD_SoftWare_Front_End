import { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { LogOut, Settings, Bell, ChevronDown, Plus, MessageSquare, Search, Settings2, Code } from 'lucide-react';
import { getHistoryAPI } from '../api/dashboardAPI';
import useUserStore from '../store/userStore';

const NavItem = ({ to, icon: Icon, text }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center p-2 rounded-lg ${
        isActive ? 'bg-pink-600 text-white' : 'hover:bg-blue-800'
      }`
    }
  >
    <Icon className="mr-3 h-5 w-5" /> {text}
  </NavLink>
);

const Sidebar = ({ history }) => {
  return (
    <div className="w-64 bg-blue-900 text-white flex flex-col p-4">
      <div className="text-2xl font-bold mb-10">CAutoD</div>
      <NavItem to="/create-project" icon={Plus} text="创建项目" />
      <nav className="mt-6 flex-1">
        <NavItem to="/geometry" icon={MessageSquare} text="几何建模" />
        <NavItem to="/parts" icon={Search} text="零件检索" />
        <NavItem to="/design-optimization" icon={Settings2} text="设计优化" />
        <NavItem to="/software-interface" icon={Code} text="软件界面" />
      </nav>
      <div className="mt-auto">
        <div className="mb-4">
          <h3 className="text-sm text-gray-400 mb-2">历史记录</h3>
          {history.slice(0, 3).map(item => (
            <a key={item.id} href="#" className="block p-2 rounded-lg hover:bg-blue-800 text-sm truncate">{item.title}</a>
          ))}
          <a href="#" className="block p-2 rounded-lg hover:bg-blue-800 text-sm text-gray-400">View all</a>
        </div>
        <div className="flex items-center p-2 rounded-lg hover:bg-blue-800 cursor-pointer">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <span className="flex-1">Alexandra</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <header className="flex items-center justify-end p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="outline">
          <LogOut className="mr-2 h-4 w-4" /> 登出
        </Button>
      </div>
    </header>
  );
};

const DashboardLayout = () => {
  const [history, setHistory] = useState([]);
  const { logout } = useUserStore();

  useEffect(() => {
    getHistoryAPI().then(res => {
      if (res.code === 200) {
        setHistory(res.data);
      }
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar history={history} />
      <div className="flex-1 flex flex-col">
        <Header onLogout={logout} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet context={{ history }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
