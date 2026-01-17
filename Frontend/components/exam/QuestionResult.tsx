// Frontend/components/exam/QuestionResult.tsx
'use client';

import { AnswerDetail, Question } from '@/lib/types';

interface QuestionResultProps {
  answerDetail: AnswerDetail;
  question: Question;
  showDetails: boolean;
  isSkipped?: boolean;
}

export default function QuestionResult({ answerDetail, question, showDetails, isSkipped = false }: QuestionResultProps) {
  const userSelectedOption = answerDetail.selected_option;
  const correctOption = question.answer_idx;
  
  // Fix: Check if marks were obtained instead of just is_correct flag
  const isCorrect = isSkipped ? false : (answerDetail.is_correct || answerDetail.marks_obtained > 0);

  // Debug logging
  console.log('Question ID:', question.id);
  console.log('Question description:', question.description);
  console.log('Description exists:', !!question.description);
  console.log('Description length:', question.description?.trim().length);
  console.log('showDetails:', showDetails);

  const getOptionClass = (optionIndex: number) => {
    if (!showDetails) return 'border-gray-200 bg-gray-50';

    if (optionIndex === correctOption) {
      return 'border-green-500 bg-green-50 text-green-800';
    }

    if (optionIndex === userSelectedOption && !isCorrect) {
      return 'border-red-500 bg-red-50 text-red-800';
    }

    if (optionIndex === userSelectedOption && isCorrect) {
      return 'border-green-500 bg-green-50 text-green-800';
    }

    return 'border-gray-200 bg-white';
  };

  const getOptionIcon = (optionIndex: number) => {
    if (!showDetails) return null;

    if (optionIndex === correctOption) {
      return (
        <svg className="w-5 h-5 text-green-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }

    if (optionIndex === userSelectedOption && !isCorrect) {
      return (
        <svg className="w-5 h-5 text-red-600 ml-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-start mb-4">
        <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 ${
          isSkipped ? 'bg-gray-100 text-gray-800' : (isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
        }`}>
          {isSkipped ? '○' : (isCorrect ? '✓' : '✗')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 flex-1 break-words">{question.content}</h3>
            <span className={`self-start px-2 py-1 rounded text-xs sm:text-sm font-medium whitespace-nowrap ${
              isSkipped ? 'bg-gray-100 text-gray-800' : (isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
            }`}>
              {isSkipped ? 'Skipped' : (answerDetail.marks_obtained > 0 ? `+${answerDetail.marks_obtained}` : answerDetail.marks_obtained)}
            </span>
          </div>

          {question.image_url && (
            <div className="mb-4">
              <img
                src={question.image_url}
                alt="Question"
                className="max-w-full max-h-48 object-contain border border-gray-200 rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {isSkipped && showDetails && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700 font-medium">এই প্রশ্নটি উত্তর দেওয়া হয়নি</span>
              </div>
            </div>
          )}

          {question.q_type === 'MCQ' && showDetails && !isSkipped && (
            <div className="space-y-3 mt-4">
              {['A', 'B', 'C', 'D'].map((letter, index) => {
                // Try to get option text from either options array or individual fields
                let optionText = '';
                let optionImage = '';

                if (question.options && question.options[index]) {
                  optionText = question.options[index];
                } else {
                  optionText = (question as any)[`option_${letter.toLowerCase()}`] || '';
                }

                // Get option image
                optionImage = (question as any)[`option_${letter.toLowerCase()}_image_url`] || '';

                // Always render all 4 options, even if empty
                return (
                  <div key={index} className={`flex items-center p-4 rounded-lg border-2 transition-colors ${getOptionClass(index)}`}>
                    <div className="flex items-start flex-1">
                      <span className="font-bold mr-3 text-lg text-gray-700">{letter}.</span>
                      <div className="flex-1">
                        <span className={`leading-relaxed ${optionText.trim() ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                          {optionText.trim() || 'অপশন টেক্সট নেই'}
                        </span>
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
                    <div className="ml-3 flex-shrink-0 flex flex-col items-end gap-1">
                      {getOptionIcon(index)}
                      {index === userSelectedOption && (
                        <span className="text-sm font-medium text-blue-600 whitespace-nowrap">(আপনার উত্তর)</span>
                      )}
                      {index === correctOption && userSelectedOption !== correctOption && (
                        <span className="text-sm font-medium text-green-600 whitespace-nowrap">(সঠিক উত্তর)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {question.q_type === 'WRITTEN' && showDetails && !isSkipped && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">আপনার উত্তর:</h4>
              <div className="bg-gray-50 p-3 rounded-lg border">
                {answerDetail.submitted_answer_text || <span className="text-gray-500 italic">কোনো উত্তর দেওয়া হয়নি</span>}
              </div>
            </div>
          )}

          {/* Show description for ALL question types (including skipped) when showDetails is true and description exists */}
          {showDetails && question.description && question.description.trim().length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">📚 উত্তরের ব্যাখ্যা:</h4>
              <p className="text-blue-900 text-sm leading-relaxed">{question.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}