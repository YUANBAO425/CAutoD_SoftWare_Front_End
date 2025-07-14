import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import useUserStore from '../store/userStore';

const MainLayout = () => {
  const { fetchUserProfile, token } = useUserStore();

  useEffect(() => {
    if (token) {
      fetchUserProfile().catch(console.error);
    }
  }, [token, fetchUserProfile]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">应用名称</h1>
          </div>
          <div>
            {/* 导航链接 */}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} 应用名称. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 