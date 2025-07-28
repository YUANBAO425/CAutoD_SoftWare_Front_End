import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useUserStore();
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("密码不匹配！");
      return;
    }
    if (!formData.userId.trim()) {
      alert("用户ID不能为空！");
      return;
    }
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('user_id', formData.userId);
      data.append('email', formData.email);
      data.append('pwd', formData.password);

      await register(data);
      alert("注册成功！即将跳转到登录页面。");
      navigate('/login');
    } catch (err) {
      console.error('注册失败:', err);
      alert(`注册失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-lg rounded-lg overflow-hidden">
        {/* Left side: Form */}
        <div className="w-1/2 bg-white p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">注册</h2>
          <p className="text-center text-gray-500 mb-6">创建你的新账户</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="userId">
                用户 ID <span className="text-red-500">*</span>
              </label>
              <Input
                id="userId"
                name="userId"
                type="number"
                placeholder="Enter your user ID"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>
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

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full bg-pink-600 text-white hover:bg-pink-700">
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              已经有账户了？ 
              <Link to="/login" className="text-blue-600 hover:underline ml-1">
                登录
              </Link>
            </p>
          </div>
        </div>

        {/* Right side: Branding */}
        <div className="w-1/2 bg-blue-800 p-8 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold mb-4">CAutoD</h1>
          <p className="mb-6">AI-powered CAD Platform</p>
          <div className="flex items-center bg-blue-700 rounded-full p-1">
            <Button size="sm" className="bg-white text-blue-800 rounded-full">白天模式</Button>
            <Button size="sm" variant="ghost" className="rounded-full">夜间模式</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
