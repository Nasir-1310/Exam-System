// app/exam/written/[examId]/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getWrittenExamById,
  getWrittenQuestionsByExamId,
  WrittenAnswer,
} from "@/lib/mockWrittenData";
import Timer from "@/components/exam/Timer";
import WrittenQuestionCard from "@/components/exam/WrittenQuestionCard";

export default function WrittenExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.examId as string);

  const exam = getWrittenExamById(examId);
  const questions = getWrittenQuestionsByExamId(examId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: WrittenAnswer }>({});
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Exam not found</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleImagesUpload = (files: File[]) => {
    const currentAnswer = answers[currentQuestion.id] || {
      question_id: currentQuestion.id,
      image_files: [],
      image_urls: [],
    };

    // Add new files and URLs to existing ones
    const newFiles = [...(currentAnswer.image_files || []), ...files];
    const newUrls = [
      ...(currentAnswer.image_urls || []),
      ...files.map((file) => URL.createObjectURL(file)),
    ];

    setAnswers({
      ...answers,
      [currentQuestion.id]: {
        question_id: currentQuestion.id,
        image_files: newFiles,
        image_urls: newUrls,
      },
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitExam = () => {
    // Store submission in sessionStorage
    sessionStorage.setItem(
      `written_exam_result_${examId}`,
      JSON.stringify({
        exam_id: examId,
        submitted_at: new Date().toISOString(),
        answers: Object.values(answers).map((answer) => ({
          question_id: answer.question_id,
          image_urls: answer.image_urls,
        })),
        evaluation_status: "pending",
      })
    );

    router.push(`/exam/written/result/${examId}`);
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      setShowSubmitWarning(true);
      return;
    }
    submitExam();
  };

  const answeredCount = Object.keys(answers).length;

  // Memoize uploadedImages to prevent reference changes
  const uploadedImages = useMemo(() => {
    return answers[currentQuestion.id]?.image_urls || [];
  }, [answers, currentQuestion.id]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pt-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <Timer
              initialSeconds={exam.duration_minutes * 60}
              onTimeUp={submitExam}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <WrittenQuestionCard
              questionNumber={currentQuestionIndex + 1}
              content={currentQuestion.content}
              marks={currentQuestion.marks}
              onImagesUpload={handleImagesUpload}
              uploadedImages={uploadedImages}
            />

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {questions.map((q, index) => {
                  const answer = answers[q.id];
                  const imageCount = answer?.image_urls?.length || 0;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`relative h-12 rounded-lg text-sm font-medium transition-colors ${
                        imageCount > 0
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : currentQuestionIndex === index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <div>{index + 1}</div>
                      {imageCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {imageCount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-700">
                    Answered ({answeredCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-gray-700">
                    Not Answered ({questions.length - answeredCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-700">Image count</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Warning Modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-4">
              You have {questions.length - answeredCount} unanswered questions.
              Do you want to submit anyway?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitWarning(false)}
                className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitWarning(false);
                  submitExam();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}