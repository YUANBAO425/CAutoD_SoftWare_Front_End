import useUserStore from '../store/userStore';

const DashboardPage = () => {
  const { user, logout } = useUserStore();

  return (
    <div className="text-center p-8">
      <h1 className="text-4xl font-bold mb-6">仪表盘</h1>
      
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        {user ? (
          <div>
            <p className="text-xl mb-4">欢迎回来，{user.name || user.email}！</p>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              登出
            </button>
          </div>
        ) : (
          <p>您尚未登录。</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
