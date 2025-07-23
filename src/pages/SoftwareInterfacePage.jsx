import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSoftwareHistory } from '@/api/softwareInterfaceAPI';
import { ArrowLeft, PlayCircle } from 'lucide-react';

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
      <div className="p-8 h-full flex flex-col bg-white">
        <Button onClick={() => setSelectedResult(null)} className="mb-4 self-start">
          <ArrowLeft className="mr-2 h-4 w-4" /> 返回历史列表
        </Button>
        <div className="flex-1 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
          <img src={selectedResult.gifUrl} alt={selectedResult.name} className="max-w-full max-h-full rounded-lg shadow-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white h-full">
      <h1 className="text-3xl font-bold mb-8">软件界面 - 结果历史</h1>
      <div className="space-y-8">
        {history.map(session => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle>{session.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {session.results.map(result => (
                  <li 
                    key={result.id}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setSelectedResult(result)}
                  >
                    <span className="font-medium">{result.name}</span>
                    <PlayCircle className="h-6 w-6 text-gray-400" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SoftwareInterfacePage;
