import { Link } from 'react-router-dom';
import useUserStore from '../store/userStore';

const HomePage = () => {
  const { user } = useUserStore();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">欢迎使用我们的应用</h1>
      
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        {user ? (
          <div>
            <p className="text-xl mb-4">您好，{user.name || user.username}！</p>
            <p className="text-gray-600 mb-6">感谢您使用我们的应用。</p>
          </div>
        ) : (
          <div>
            <p className="text-xl mb-4">开始使用我们的应用</p>
            <p className="text-gray-600 mb-6">请登录以访问所有功能。</p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                登录
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                注册
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 