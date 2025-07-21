import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useUserStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('登录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-lg rounded-lg overflow-hidden">
        {/* Left side: Form */}
        <div className="w-1/2 bg-white p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">登录</h2>
          <p className="text-center text-gray-500 mb-6">输入你的邮箱和密码</p>

          <Button variant="outline" className="w-full mb-4">
            <img src="/src/assets/google_logo_icon_169090.svg" alt="Google" className="w-5 h-5 mr-2" />
            Google 登录
          </Button>

          <div className="flex items-center my-4">
            <hr className="w-full" />
            <span className="px-2 text-gray-400">or</span>
            <hr className="w-full" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                密码 <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Checkbox id="remember-me" />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                  保持登录
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                忘记密码？
              </Link>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full bg-pink-600 text-white hover:bg-pink-700">
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还未注册？ 
              <Link to="/register" className="text-blue-600 hover:underline ml-1">
                注册一个账号
              </Link>
            </p>
          </div>
        </div>

        {/* Right side: Branding */}
        <div className="w-1/2 bg-blue-800 p-8 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold mb-4">CAutoD</h1>
          <p className="mb-6">AI-powered CAD Platform</p>
          {/* Dark/Light mode toggle */}
          <div className="flex items-center bg-blue-700 rounded-full p-1">
            <Button size="sm" className="bg-white text-blue-800 rounded-full">白天模式</Button>
            <Button size="sm" variant="ghost" className="rounded-full">夜间模式</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
