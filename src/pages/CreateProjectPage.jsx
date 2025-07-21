import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { MessageSquare, Search, Settings2, Code } from 'lucide-react';
import useUserStore from '../store/userStore';
import { getHistoryAPI } from '../api/dashboardAPI';
import { useOutletContext } from 'react-router-dom';

const QuickActionButton = ({ icon: Icon, text }) => (
  <Button variant="outline" className="flex-1 bg-white border-gray-300 text-gray-800 rounded-lg shadow-sm hover:bg-gray-50">
    <Icon className="mr-2 h-4 w-4" /> {text}
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section 1: Welcome Message */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-2">早上好, {user?.name || 'Alexandra'}</h1>
        <p className="text-pink-600 font-semibold mb-4">开始您的设计！</p>
        <div className="inline-flex items-center space-x-4">
          <span className="text-gray-500">Free plan</span>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white">Upgrade now</Button>
        </div>
      </div>

      {/* Section 2: Quick Actions */}
      <div className="flex space-x-4 mb-12">
        <QuickActionButton icon={MessageSquare} text="几何建模" />
        <QuickActionButton icon={Search} text="零件检索" />
        <QuickActionButton icon={Settings2} text="设计优化" />
        <QuickActionButton icon={Code} text="软件界面" />
      </div>

      {/* Section 4: History */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">历史记录</h2>
          <Button variant="link" className="text-pink-600">View all {'>'}</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {history.map(item => (
            <HistoryCard key={item.id} title={item.title} time={item.time} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
