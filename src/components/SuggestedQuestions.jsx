import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const SuggestedQuestions = ({ questions, onQuestionClick }) => {
  // 确保 questions 对象存在，并且其 data 属性是一个非空数组
  if (!questions || !questions.data || questions.data.length === 0) {
    return null;
  }

  return (
    <div className="my-4 border-t pt-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-2">猜你想问</h4>
      <div className="flex flex-col items-start space-y-2">
        {questions.data.map((q, index) => (
          <Button
            key={index}
            variant="outline"
            className="bg-white h-auto whitespace-normal text-left justify-between w-full"
            onClick={() => onQuestionClick(q)}
          >
            <span>{q}</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
