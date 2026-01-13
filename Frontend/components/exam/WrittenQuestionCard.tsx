// components/exam/WrittenQuestionCard.tsx
"use client";

import { useState, useEffect } from "react";

interface WrittenQuestionCardProps {
  questionNumber: number;
  content: string;
  marks: number;
  onImagesUpload: (files: File[]) => void;
  uploadedImages?: string[];
}

export default function WrittenQuestionCard({
  questionNumber,
  content,
  marks,
  onImagesUpload,
  uploadedImages = [],
}: WrittenQuestionCardProps) {
  const [previews, setPreviews] = useState<string[]>(uploadedImages);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  // Update previews when uploadedImages prop changes (question navigation)
  useEffect(() => {
    setPreviews(uploadedImages);
    setImageLoadErrors(new Set()); // Reset errors when changing questions
  }, [uploadedImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImagesUpload(files);
    }
    // Reset input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const openImagePreview = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImagePreview = () => {
    setSelectedImageIndex(null);
  };

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set([...prev, imageUrl]));
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Question {questionNumber}
          </h2>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow">
            {marks} marks
          </span>
        </div>

        <p className="text-gray-700 mb-6 whitespace-pre-wrap leading-relaxed">{content}</p>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Your Answer</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload images of your handwritten answer (multiple images allowed)
          </p>

          {/* Upload Button */}
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors shadow-md hover:shadow-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-800">
                  Uploaded Images ({previews.length}):
                </p>
                <span className="text-xs text-gray-500">
                  Click on image to preview
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-white flex items-center justify-center p-2">
                      {imageLoadErrors.has(preview) ? (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-center">Failed to load</span>
                        </div>
                      ) : (
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => openImagePreview(index)}
                          onError={() => handleImageError(preview)}
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* Image Number Badge */}
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                      #{index + 1}
                    </div>

                    {/* Action Buttons Overlay */}
                    {!imageLoadErrors.has(preview) && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                        <button
                          onClick={() => openImagePreview(index)}
                          className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2.5 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg transform hover:scale-110"
                          title="Preview"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-all shadow-lg transform hover:scale-110"
                          title="Remove"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Image Preview Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeImagePreview}
        >
          <button
            onClick={closeImagePreview}
            className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 p-3 rounded-full transition-all z-10 shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="max-w-6xl max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl p-4 shadow-2xl">
              <img
                src={previews[selectedImageIndex]}
                alt="Full preview"
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>

            {/* Navigation Controls */}
            {previews.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
                  }}
                  disabled={selectedImageIndex === 0}
                  className="bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
                >
                  ← Previous
                </button>

                <span className="text-white font-bold bg-gray-900 bg-opacity-80 px-6 py-3 rounded-lg shadow-lg">
                  {selectedImageIndex + 1} / {previews.length}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(
                      Math.min(previews.length - 1, selectedImageIndex + 1)
                    );
                  }}
                  disabled={selectedImageIndex === previews.length - 1}
                  className="bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}