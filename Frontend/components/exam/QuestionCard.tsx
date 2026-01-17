'use client';

import { Question } from '@/lib/types';
import { useState, useEffect } from 'react';

interface QuestionCardProps {
  question: Question;
  selectedOption?: number | null;
  submittedAnswerText?: string | null;
  onAnswerChange: (selectedOption: number | null, submittedAnswerText?: string | null) => void;
}

export default function QuestionCard({
  question,
  selectedOption: initialSelectedOption,
  submittedAnswerText: initialSubmittedAnswerText,
  onAnswerChange,
}: QuestionCardProps) {
  const [currentSelectedOption, setCurrentSelectedOption] = useState<number | null>(initialSelectedOption ?? null);
  const [currentSubmittedAnswerText, setCurrentSubmittedAnswerText] = useState<string | null>(initialSubmittedAnswerText ?? null);

  useEffect(() => {
    setCurrentSelectedOption(initialSelectedOption ?? null);
    setCurrentSubmittedAnswerText(initialSubmittedAnswerText ?? null);
  }, [initialSelectedOption, initialSubmittedAnswerText, question.id]);

  const handleOptionSelect = (index: number) => {
    setCurrentSelectedOption(index);
    onAnswerChange(index, null); // Clear text answer if MCQ option is selected
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCurrentSubmittedAnswerText(text);
    onAnswerChange(null, text); // Clear selected option if text answer is provided
  };

  // Helper function to get option text
  const getOptionText = (index: number) => {
    if (question.options && question.options[index]) {
      return question.options[index];
    }
    const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'] as const;
    return (question as any)[optionKeys[index]] || '';
  };

  // Helper function to get option image
  const getOptionImage = (index: number) => {
    const imageKeys = ['option_a_image_url', 'option_b_image_url', 'option_c_image_url', 'option_d_image_url'] as const;
    return (question as any)[imageKeys[index]] || '';
  };

  return (
    <div>
      {/* Question Image */}
      {question.image_url && (
        <div className="mb-6">
          <img
            src={question.image_url}
            alt="Question"
            className="max-w-full max-h-64 object-contain border border-gray-200 rounded-lg shadow-sm mx-auto"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {question.q_type === "MCQ" && (
        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((letter, index) => {
            const optionText = getOptionText(index);
            const optionImage = getOptionImage(index);

            // Skip empty options
            if (!optionText.trim()) return null;

            return (
              <label
                key={index}
                className={`flex items-start w-full p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  currentSelectedOption === index
                    ? "border-blue-500 bg-blue-50 text-gray-900 shadow-md"
                    : "border-gray-300 hover:border-gray-400 bg-white text-gray-800 hover:shadow-sm"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={index}
                  checked={currentSelectedOption === index}
                  onChange={() => handleOptionSelect(index)}
                  className="mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 mt-1 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start">
                    <span className="font-bold mr-3 text-gray-900 text-lg flex-shrink-0">
                      {letter}.
                    </span>
                    <div className="flex-1">
                      <span className="text-gray-900 leading-relaxed">{optionText}</span>
                      {optionImage && (
                        <div className="mt-2">
                          <img
                            src={optionImage}
                            alt={`Option ${letter}`}
                            className="max-w-32 max-h-32 object-contain border border-gray-200 rounded-lg shadow-sm"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {currentSelectedOption === index && (
                  <div className="ml-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      )}

      {question.q_type === "WRITTEN" && (
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          rows={6}
          placeholder="এখানে আপনার উত্তর লিখুন..."
          value={currentSubmittedAnswerText ?? ''}
          onChange={handleTextChange}
        />
      )}
    </div>
  );
}