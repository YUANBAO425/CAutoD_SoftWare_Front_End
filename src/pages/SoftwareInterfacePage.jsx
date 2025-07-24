import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getSoftwareHistory } from '@/api/softwareInterfaceAPI';
import { ArrowLeft } from 'lucide-react';

const ResultCard = ({ result, onSelect }) => (
  <Card 
    className="cursor-pointer hover:shadow-xl transition-shadow duration-300 group"
    onClick={() => onSelect(result)}
  >
    <CardHeader className="p-0">
      <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-100">
        <img 
          src={result.gifUrl} 
          alt={result.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    </CardHeader>
    <CardContent className="p-4">
      <p className="font-semibold text-lg truncate">{result.name}</p>
      <p className="text-sm text-gray-500 truncate">{result.sessionTitle}</p>
    </CardContent>
  </Card>
);

const SoftwareInterfacePage = () => {
  const [allResults, setAllResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await getSoftwareHistory();
        const flattenedResults = response.data.history.flatMap(session => 
          session.results.map(result => ({
            ...result,
            sessionTitle: session.title
          }))
        );
        setAllResults(flattenedResults);
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
      <div className="flex items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (selectedResult) {
    return (
      <div className="p-8 bg-white h-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold">{selectedResult.name}</h1>
            <p className="text-md text-gray-500">{selectedResult.sessionTitle}</p>
          </div>
          <Button onClick={() => setSelectedResult(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回列表
          </Button>
        </div>
        <div className="flex-1 bg-gray-100 rounded-lg p-4 flex items-center justify-center mt-4">
          <img 
            src={selectedResult.gifUrl} 
            alt={selectedResult.name} 
            className="max-w-full max-h-full rounded-md shadow-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white h-full">
      <h1 className="text-3xl font-bold mb-8">软件界面 - 结果历史</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allResults.map(result => (
          <ResultCard key={result.id} result={result} onSelect={setSelectedResult} />
        ))}
      </div>
    </div>
  );
};

export default SoftwareInterfacePage;
