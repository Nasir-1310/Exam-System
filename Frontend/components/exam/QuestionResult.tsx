// Frontend/components/exam/QuestionResult.tsx
'use client';

import { AnswerDetail, Question } from '@/lib/types';
import { convertGoogleDriveUrl } from '@/lib/googleDriveUtils';

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

  // ============================================================================
  // ADDED: Helper function to get proper image source URL
  // ============================================================================
  const getImageSrc = (imageUrl: string): string => {
    if (!imageUrl) return "";

    // If it's already a full URL (http:// or https://)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Check if it's a Google Drive URL - convert it
      if (imageUrl.includes('drive.google.com')) {
        return convertGoogleDriveUrl(imageUrl);
      }
      // Backend URL or other external URL - use as-is
      return imageUrl;
    }
    
    // If it's a relative path starting with /uploads/
    if (imageUrl.startsWith('/uploads/')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    
    // Local path from public folder (/questions/...)
    if (imageUrl.startsWith('/questions/') || imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // If it contains drive.google.com but no protocol
    if (imageUrl.includes('drive.google.com')) {
      return convertGoogleDriveUrl(`https://${imageUrl}`);
    }
    
    // Default: return as-is
    return imageUrl;
  };

  // ============================================================================
  // ADDED: Helper to check if a string is an image URL
  // ============================================================================
  const isImageUrl = (text: string): boolean => {
    if (!text) return false;
    
    if (text.startsWith('http://') || text.startsWith('https://')) {
      return true;
    }
    
    if (text.startsWith('/uploads/') || text.startsWith('/questions/')) {
      return true;
    }
    
    if (text.includes('drive.google.com')) {
      return true;
    }
    
    return false;
  };
  // ============================================================================

  const getOptionClass = (optionIndex: number) => {
    if (!showDetails) return 'border-gray-200 bg-gray-50';

    // Always show correct answer
    if (optionIndex === correctOption) {
      return 'border-green-500 bg-green-50 text-green-800';
    }

    // For skipped questions, don't highlight user selections
    if (isSkipped) {
      return 'border-gray-200 bg-white';
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

    if (optionIndex === userSelectedOption && !isCorrect && !isSkipped) {
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
            {/* ============================================================================
                FIXED: Only show question content if it's NOT an image URL
                ============================================================================ */}
            {question.content && !isImageUrl(question.content) && (
              <h3 className="text-base sm:text-lg font-medium text-gray-900 flex-1 break-words">{question.content}</h3>
            )}
            <span className={`self-start px-2 py-1 rounded text-xs sm:text-sm font-medium whitespace-nowrap ${
              isSkipped ? 'bg-gray-100 text-gray-800' : (isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
            }`}>
              {isSkipped ? 'Skipped' : (answerDetail.marks_obtained > 0 ? `+${answerDetail.marks_obtained}` : answerDetail.marks_obtained)}
            </span>
          </div>

          {/* ============================================================================
              FIXED: Display question image from image_url field using <img> tag
              ============================================================================ */}
          {question.image_url && (
            <div className="mb-4 relative w-full max-w-2xl mx-auto">
              <img
                src={getImageSrc(question.image_url)}
                alt="Question"
                className="w-full h-auto max-h-80 object-contain border-2 border-gray-300 rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiByeD0iMTIiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwMCA2MFYxNDBNMTEyIDgwSDE4OCIgc3Ryb2tlPSIjOUNBNEFGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8dGV4dCB4PSIyMDAiIHk9IjEwMCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlDQTQ5RiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
                  target.alt = 'Question image failed to load';
                  console.warn('Question result image failed to load:', question.image_url);
                }}
                loading="lazy"
              />
            </div>
          )}

          {/* ============================================================================
              LEGACY SUPPORT: If content field contains an image URL (backward compatibility)
              ============================================================================ */}
          {question.content && isImageUrl(question.content) && (
            <div className="mb-4 relative w-full max-w-2xl mx-auto">
              <img
                src={getImageSrc(question.content)}
                alt="Question"
                className="w-full h-auto max-h-80 object-contain border-2 border-gray-300 rounded-xl shadow-lg"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiByeD0iMTIiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwMCA2MFYxNDBNMTEyIDgwSDE4OCIgc3Ryb2tlPSIjOUNBNEFGIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8dGV4dCB4PSIyMDAiIHk9IjEwMCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlDQTQ5RiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
                  target.alt = 'Question image failed to load';
                  console.warn('Question result image (from content) failed to load:', question.content);
                }}
                loading="lazy"
              />
            </div>
          )}
          {/* ============================================================================
              END QUESTION IMAGE DISPLAY
              ============================================================================ */}

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

          {question.q_type === 'MCQ' && showDetails && (
            <div className="space-y-2 sm:space-y-3 mt-4">
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
                  <div key={index} className={`flex items-center p-3 sm:p-4 rounded-lg border-2 transition-colors ${getOptionClass(index)}`}>
                    <div className="flex items-start flex-1 min-w-0">
                      <span className="font-bold mr-2 sm:mr-3 text-base sm:text-lg text-gray-700 flex-shrink-0">{letter}.</span>
                      <div className="flex-1 min-w-0">
                        {/* ============================================================================
                            FIXED: Check if option text is an image URL
                            ============================================================================ */}
                        {optionText.trim() && isImageUrl(optionText) ? (
                          // Option text is an image URL - render as image
                          <div className="relative w-40 sm:w-48 h-24 sm:h-32">
                            <img
                              src={getImageSrc(optionText)}
                              alt={`Option ${letter}`}
                              className="w-full h-full object-contain border-2 border-gray-300 rounded-lg shadow-md"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDE5MiAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTI4IiByeD0iOCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNOTYgNDBWODhNNjQgNTJIMTI4IiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjx0ZXh0IHg9Ijk2IiB5PSI4MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTQ5RiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
                                target.alt = `Option ${letter} image failed to load`;
                                console.warn(`Option ${letter} result image (from text) failed to load:`, optionText);
                              }}
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          // Option text is regular text
                          <span className={`leading-relaxed text-sm sm:text-base break-words ${optionText.trim() ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                            {optionText.trim() || 'অপশন টেক্সট নেই'}
                          </span>
                        )}
                        
                        {/* ============================================================================
                            Separate option image field using <img> tag
                            ============================================================================ */}
                        {optionImage && (
                          <div className={`${optionText.trim() ? 'mt-2' : ''} relative w-40 sm:w-48 h-24 sm:h-32`}>
                            <img
                              src={getImageSrc(optionImage)}
                              alt={`Option ${letter}`}
                              className="w-full h-full object-contain border-2 border-gray-300 rounded-lg shadow-md"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDE5MiAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTI4IiByeD0iOCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNOTYgNDBWODhNNjQgNTJIMTI4IiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjx0ZXh0IHg9Ijk2IiB5PSI4MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTRBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
                                target.alt = `Option ${letter} image failed to load`;
                                console.warn(`Option ${letter} result image failed to load:`, optionImage);
                              }}
                              loading="lazy"
                            />
                          </div>
                        )}
                        {/* ============================================================================
                            END OPTION IMAGE DISPLAY
                            ============================================================================ */}
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-3 flex-shrink-0 flex flex-col items-end gap-1">
                      {getOptionIcon(index)}
                      {index === userSelectedOption && (
                        <span className="text-xs sm:text-sm font-medium text-blue-600 whitespace-nowrap">(আপনার উত্তর)</span>
                      )}
                      {index === correctOption && userSelectedOption !== correctOption && (
                        <span className="text-xs sm:text-sm font-medium text-green-600 whitespace-nowrap">(সঠিক উত্তর)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {question.q_type === 'WRITTEN' && showDetails && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">আপনার উত্তর:</h4>
              <div className="bg-gray-50 p-3 rounded-lg border">
                {isSkipped ? (
                  <span className="text-gray-500 italic">প্রশ্নটি স্কিপ করা হয়েছে</span>
                ) : (
                  answerDetail.submitted_answer_text || <span className="text-gray-500 italic">কোনো উত্তর দেওয়া হয়নি</span>
                )}
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