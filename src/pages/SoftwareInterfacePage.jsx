import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getSoftwareHistory } from '@/api/softwareInterfaceAPI';
import { ArrowLeft } from 'lucide-react';

const SoftwareInterfacePage = () => {
  const [history, setHistory] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await getSoftwareHistory();
        setHistory(response.data.history);
      } catch (error) {
        console.error("Failed to fetch software history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (selectedResult) {
    return (
      <div className="p-8 h-full flex flex-col">
        <Button onClick={() => setSelectedResult(null)} className="mb-4 self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> 返回列表
        </Button>
        <div className="flex-1 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
          <img src={selectedResult.gifUrl} alt={selectedResult.name} className="max-w-full max-h-full rounded-lg shadow-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">软件界面 - 结果历史</h1>
      <div className="space-y-6">
        {history.map(session => (
          <div key={session.id}>
            <h2 className="text-xl font-semibold mb-3">{session.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {session.results.map(result => (
                <div 
                  key={result.id}
                  className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedResult(result)}
                >
                  <p className="font-medium">{result.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftwareInterfacePage;
