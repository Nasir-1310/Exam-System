// Frontend/components/exam/QuestionCard.tsx
"use client";

import { convertGoogleDriveUrl } from "@/lib/googleDriveUtils";
import { Question } from "@/lib/types";
import { useEffect, useState } from "react";

interface QuestionCardProps {
  question: Question;
  selectedOption?: number | null;
  submittedAnswerText?: string | null;
  onAnswerChange: (
    selectedOption: number | null,
    submittedAnswerText?: string | null,
  ) => void;
}

export default function QuestionCard({
  question,
  selectedOption: initialSelectedOption,
  submittedAnswerText: initialSubmittedAnswerText,
  onAnswerChange,
}: QuestionCardProps) {
  const [currentSelectedOption, setCurrentSelectedOption] = useState<number | null>(
    initialSelectedOption ?? null
  );
  const [currentSubmittedAnswerText, setCurrentSubmittedAnswerText] = useState<string | null>(
    initialSubmittedAnswerText ?? null
  );

  useEffect(() => {
    setCurrentSelectedOption(initialSelectedOption ?? null);
    setCurrentSubmittedAnswerText(initialSubmittedAnswerText ?? null);
  }, [initialSelectedOption, initialSubmittedAnswerText, question.id]);

  const handleOptionSelect = (index: number) => {
    setCurrentSelectedOption(index);
    onAnswerChange(index, null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCurrentSubmittedAnswerText(text);
    onAnswerChange(null, text);
  };

  const getImageSrc = (imageUrl: string): string => {
    if (!imageUrl) return "";

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      if (imageUrl.includes('drive.google.com')) {
        return convertGoogleDriveUrl(imageUrl);
      }
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/uploads/')) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }
    
    if (imageUrl.startsWith('/questions/') || imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    if (imageUrl.includes('drive.google.com')) {
      return convertGoogleDriveUrl(`https://${imageUrl}`);
    }
    
    return imageUrl;
  };

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

  const getOptionText = (index: number) => {
    if (question.options && question.options[index]) {
      return question.options[index];
    }
    const optionKeys = [
      "option_a",
      "option_b",
      "option_c",
      "option_d",
    ] as const;
    return (question as any)[optionKeys[index]] || "";
  };

  const getOptionImage = (index: number) => {
    const imageKeys = [
      "option_a_image_url",
      "option_b_image_url",
      "option_c_image_url",
      "option_d_image_url",
    ] as const;
    return (question as any)[imageKeys[index]] || "";
  };

  return (
    <div>
      {/* ✅ CHANGED: Using <img> instead of <Image> */}
      {question.image_url && (
        <div className="mb-6 relative w-full h-64">
          <img
            src={getImageSrc(question.image_url)}
            alt="Question image"
            className="w-full h-full object-contain border-2 border-gray-300 rounded-lg shadow-md"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDE5MiAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTI4IiByeD0iOCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNOTYgNDBWODhNNjQgNTJIMTI4IiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjx0ZXh0IHg9Ijk2IiB5PSI4MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTRBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPg==";
              target.alt = "Failed to load question image";
              console.error('Question image failed to load:', question.image_url);
            }}
            loading="lazy"
          />
        </div>
      )}

      {question.q_type === "MCQ" && (
        <div className="space-y-3">
          {["A", "B", "C", "D"].map((letter, index) => {
            const optionText = getOptionText(index);
            const optionImage = getOptionImage(index);

            if (!optionText.trim() && !optionImage) return null;

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
                      {/* ✅ CHANGED: Using <img> instead of <Image> */}
                      {optionText.trim() && isImageUrl(optionText) ? (
                        <div className="relative w-48 h-32">
                          <img
                            src={getImageSrc(optionText)}
                            alt={`Option ${letter} image`}
                            className="w-full h-full object-contain border-2 border-gray-300 rounded-lg shadow-md"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDE5MiAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTI4IiByeD0iOCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNOTYgNDBWODhNNjQgNTJIMTI4IiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjx0ZXh0IHg9Ijk2IiB5PSI4MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTRBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPg==";
                              target.alt = `Failed to load option ${letter} image`;
                              console.error(`Option ${letter} text image failed to load:`, optionText);
                            }}
                            loading="lazy"
                          />
                        </div>
                      ) : optionText.trim() ? (
                        <span className="text-gray-900 leading-relaxed">
                          {optionText}
                        </span>
                      ) : null}

                      {/* ✅ CHANGED: Using <img> instead of <Image> */}
                      {optionImage && (
                        <div className={optionText.trim() ? "mt-2 relative w-48 h-32" : "relative w-48 h-32"}>
                          <img
                            src={getImageSrc(optionImage)}
                            alt={`Option ${letter} image`}
                            className="w-full h-full object-contain border-2 border-gray-300 rounded-lg shadow-md"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDE5MiAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTI4IiByeD0iOCIgZmlsbD0iI0U1RTdFQiIvPgo8cGF0aCBkPSJNOTYgNDBWODhNNjQgNTJIMTI4IiBzdHJva2U9IiM5Q0E0QUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjx0ZXh0IHg9Ijk2IiB5PSI4MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTRBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPg==";
                              target.alt = `Failed to load option ${letter} image`;
                              console.error(`Option ${letter} image failed to load:`, optionImage);
                            }}
                            loading="lazy"
                          />
                        </div>
                      )}

                      {!optionText.trim() && !optionImage && (
                        <span className="text-gray-400 italic">
                          অপশন টেক্সট নেই
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {currentSelectedOption === index && (
                  <div className="ml-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2 h-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
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
          value={currentSubmittedAnswerText ?? ""}
          onChange={handleTextChange}
        />
      )}
    </div>
  );
}