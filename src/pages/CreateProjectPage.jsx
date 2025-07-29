import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { MessageSquare, Search, Settings2, Code, MoreHorizontal } from 'lucide-react';
import useUserStore from '../store/userStore';
import { useOutletContext, useNavigate } from 'react-router-dom';

const QuickActionButton = ({ icon: Icon, text, onClick }) => (
  <Button
    onClick={onClick}
    variant="outline"
    className="flex-1 px-6 py-4 bg-white border border-gray-300 text-gray-800 font-medium rounded-xl shadow-sm hover:bg-pink-100 hover:border-pink-300 transition-colors text-lg"
  >
    <Icon className="mr-3 h-6 w-6 text-pink-500" />
    {text}
  </Button>
);

const HistoryCard = ({ title, time }) => (
  <Card className="border-l-4 border-pink-500">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-500">{time}</p>
    </CardContent>
  </Card>
);

const CreateProjectPage = () => {
  const { user } = useUserStore();
  const { history } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section 1: Welcome Message */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-2">你好, {user?.email?.split('@')[0] || '用户'}</h1>
        <p className="text-pink-600 font-semibold mb-4">开始您的设计！</p>
        <div className="inline-flex items-center space-x-4">
          <span className="text-gray-500">Free plan</span>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white">Upgrade now</Button>
        </div>
      </div>

      {/* Section 2: Quick Actions */}
      <div className="flex space-x-4 mb-8">
        <QuickActionButton icon={MessageSquare} text="几何建模" onClick={() => navigate('/geometry')} />
        <QuickActionButton icon={Search} text="零件检索" onClick={() => navigate('/parts')} />
        <QuickActionButton icon={Settings2} text="设计优化" onClick={() => navigate('/design-optimization')} />
        <QuickActionButton icon={Code} text="软件界面" onClick={() => navigate('/software-interface')} />
      </div>

      {/* Section 4: History */}
      <div className="mt-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">历史记录</h2>
          <Button variant="link" className="text-pink-600" onClick={() => navigate('/history')}>View all {'>'}</Button>
        </div>
        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {history.slice(0, 3).map(item => (
              <HistoryCard key={item.id} title={item.title} time={item.time} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">暂无历史记录</p>
            <p className="text-sm text-gray-400 mt-2">您创建的项目将会出现在这里</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProjectPage;
