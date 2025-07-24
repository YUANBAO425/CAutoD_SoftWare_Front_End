import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search } from 'lucide-react';
import { getHistoryAPI } from '../api/dashboardAPI';

const HistoryItem = ({ item, onDelete }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
    <div>
      <p className="font-semibold">{item.title}</p>
      <p className="text-sm text-gray-500">{item.relativeTime}</p>
    </div>
    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
      <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-500" />
    </Button>
  </div>
);

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await getHistoryAPI();
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = (id) => {
    setHistory(history.filter(item => item.id !== id));
  };

  const filteredHistory = history.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-pink-600">历史记录</h1>
      
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search your topic history here..."
          className="w-full p-6 rounded-full border-gray-300 pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">All</h2>
        <Button variant="link" className="text-gray-600">Select all</Button>
      </div>

      <div className="space-y-4">
        {filteredHistory.map(item => (
          <HistoryItem key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
