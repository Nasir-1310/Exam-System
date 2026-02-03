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

  const [answers, setAnswers] = useState<{ [key: number]: WrittenAnswer }>({});
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Exam not found</p>
      </div>
    );
  }

  const handleImagesUpload = (questionId: number, files: File[]) => {
    const currentAnswer = answers[questionId] || {
      question_id: questionId,
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
      [questionId]: {
        question_id: questionId,
        image_files: newFiles,
        image_urls: newUrls,
      },
    });
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

  // Function to scroll to specific question
  const scrollToQuestion = (index: number) => {
    const element = document.getElementById(`written-question-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pt-20">
      <div className="max-w-5xl mx-auto">
        {/* Header - Sticky */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 sticky top-16 z-40">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">
                Total Questions: {questions.length}
              </p>
            </div>
            <Timer
              duration={exam.duration_minutes * 60}
              onTimeUp={submitExam}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* All Questions Panel */}
          <div className="lg:col-span-3 space-y-6">
            {questions.map((question, index) => {
              // Memoize uploaded images for each question
              const uploadedImages = answers[question.id]?.image_urls || [];

              return (
                <div key={question.id} id={`written-question-${index}`}>
                  <WrittenQuestionCard
                    questionNumber={index + 1}
                    content={question.content}
                    marks={question.marks}
                    onImagesUpload={(files) =>
                      handleImagesUpload(question.id, files)
                    }
                    uploadedImages={uploadedImages}
                  />
                </div>
              );
            })}

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white font-medium text-lg rounded-lg hover:bg-green-700 shadow-lg"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-44">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {questions.map((q, index) => {
                  const answer = answers[q.id];
                  const imageCount = answer?.image_urls?.length || 0;

                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(index)}
                      className={`relative h-12 rounded-lg text-sm font-medium transition-colors ${
                        imageCount > 0
                          ? "bg-green-500 text-white hover:bg-green-600"
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