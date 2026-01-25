// app/exam/written/result/[examId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getWrittenExamById, getWrittenQuestionsByExamId } from "@/lib/mockWrittenData";

interface WrittenSubmission {
  exam_id: number;
  submitted_at: string;
  evaluation_status: "pending" | "evaluated";
  obtained_marks?: number;
  moderator_feedback?: string;
  answers: Array<{
    question_id: number;
    image_urls?: string[];
  }>;
}

export default function WrittenExamResultPage() {
  const params = useParams();
  const examId = parseInt(params.examId as string);
  const [submission, setSubmission] = useState<WrittenSubmission | null>(null);
  const [selectedImages, setSelectedImages] = useState<{
    questionId: number;
    imageIndex: number;
  } | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  const exam = getWrittenExamById(examId);
  const questions = getWrittenQuestionsByExamId(examId);

  useEffect(() => {
    const storedSubmission = sessionStorage.getItem(
      `written_exam_result_${examId}`
    );
    if (storedSubmission) {
      setSubmission(JSON.parse(storedSubmission));
    }
  }, [examId]);

  if (!exam || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading submission...</p>
      </div>
    );
  }

  const isPending = submission.evaluation_status === "pending";

  const handleDownloadImage = (imageUrl: string, questionNum: number, imageIndex: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `question_${questionNum}_image_${imageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openImagePreview = (questionId: number, imageIndex: number) => {
    setSelectedImages({ questionId, imageIndex });
  };

  const closeImagePreview = () => {
    setSelectedImages(null);
  };

  const getCurrentImages = () => {
    if (!selectedImages) return [];
    const answer = submission.answers.find(a => a.question_id === selectedImages.questionId);
    return answer?.image_urls || [];
  };

  const handleImageError = (imageUrl: string) => {
    setImageLoadErrors(prev => new Set([...prev, imageUrl]));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            {isPending ? (
              <>
                <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
                  <svg
                    className="w-12 h-12 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Submission Received
                </h1>
                <p className="text-gray-600 mb-4">
                  Your answers are pending evaluation by a moderator
                </p>
                <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                  Status: Under Review
                </div>
              </>
            ) : (
              <>
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <svg
                    className="w-12 h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Evaluation Complete
                </h1>
                <p className="text-gray-600 mb-4">
                  Your exam has been evaluated
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">
                      Your Score
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {submission.obtained_marks} / {exam.total_marks}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">
                      Percentage
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {((submission.obtained_marks! / exam.total_marks) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Exam Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Exam Details</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Exam:</span> {exam.title}
            </p>
            <p>
              <span className="font-medium">Total Marks:</span> {exam.total_marks}
            </p>
            <p>
              <span className="font-medium">Submitted at:</span>{" "}
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Questions Answered:</span>{" "}
              {submission.answers.length} / {questions.length}
            </p>
          </div>
        </div>

        {/* Moderator Feedback (if evaluated) */}
        {!isPending && submission.moderator_feedback && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Moderator Feedback
            </h3>
            <p className="text-blue-800">{submission.moderator_feedback}</p>
          </div>
        )}

        {/* Submitted Answers */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Submitted Answers
          </h2>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const answer = submission.answers.find(
                (a) => a.question_id === question.id
              );

              return (
                <div
                  key={question.id}
                  className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 mb-2">
                        {index + 1}. {question.content}
                      </p>
                      <span className="text-sm text-gray-600">
                        {question.marks} marks
                      </span>
                    </div>
                  </div>

                  {answer?.image_urls && answer.image_urls.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Your Answer ({answer.image_urls.length} images):
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {answer.image_urls.map((imageUrl, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative group border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm"
                          >
                            <div className="aspect-square bg-white flex items-center justify-center p-2">
                              {imageLoadErrors.has(imageUrl) ? (
                                <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs text-center">Image not available</span>
                                </div>
                              ) : (
                                <img
                                  src={imageUrl}
                                  alt={`Answer ${imgIndex + 1}`}
                                  className="w-full h-full object-contain cursor-pointer"
                                  onClick={() => openImagePreview(question.id, imgIndex)}
                                  onError={() => handleImageError(imageUrl)}
                                  loading="lazy"
                                />
                              )}
                            </div>

                            {/* Image Number Badge */}
                            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                              {imgIndex + 1}
                            </div>
                            
                            {/* Hover Overlay with Actions */}
                            {!imageLoadErrors.has(imageUrl) && (
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openImagePreview(question.id, imgIndex)}
                                  className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2.5 rounded-full hover:bg-gray-100 shadow-lg transition-all transform hover:scale-110"
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
                                  onClick={() => handleDownloadImage(imageUrl, index + 1, imgIndex)}
                                  className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2.5 rounded-full hover:bg-gray-100 shadow-lg transition-all transform hover:scale-110"
                                  title="Download"
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
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mt-2">No answer submitted</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/exam/written"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Back to Written Exams
          </Link>
          <Link
            href="/exam"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
          >
            All Exams
          </Link>
        </div>
      </div>

      {/* Full Screen Image Preview Modal */}
      {selectedImages && (
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

          <div className="max-w-6xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl p-4 shadow-2xl">
              <img
                src={getCurrentImages()[selectedImages.imageIndex]}
                alt="Full preview"
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>
            
            {/* Navigation Controls */}
            {getCurrentImages().length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImages({
                      ...selectedImages,
                      imageIndex: Math.max(0, selectedImages.imageIndex - 1)
                    });
                  }}
                  disabled={selectedImages.imageIndex === 0}
                  className="bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
                >
                  ← Previous
                </button>
                
                <span className="text-white font-bold bg-gray-900 bg-opacity-80 px-6 py-3 rounded-lg shadow-lg">
                  {selectedImages.imageIndex + 1} / {getCurrentImages().length}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImages({
                      ...selectedImages,
                      imageIndex: Math.min(getCurrentImages().length - 1, selectedImages.imageIndex + 1)
                    });
                  }}
                  disabled={selectedImages.imageIndex === getCurrentImages().length - 1}
                  className="bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg"
                >
                  Next →
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const answer = submission.answers.find(a => a.question_id === selectedImages.questionId);
                    const questionIndex = questions.findIndex(q => q.id === selectedImages.questionId);
                    if (answer?.image_urls) {
                      handleDownloadImage(answer.image_urls[selectedImages.imageIndex], questionIndex + 1, selectedImages.imageIndex);
                    }
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all shadow-lg"
                >
                  ⬇ Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}