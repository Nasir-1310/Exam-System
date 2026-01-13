// app/exam/mcq/[examId]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getExamById, getQuestionsByExamId } from "@/lib/mockExamData";
import Timer from "@/components/exam/Timer";
import QuestionCard from "@/components/exam/QuestionCard";

export default function MCQExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.examId as string);

  const exam = getExamById(examId);
  const questions = getQuestionsByExamId(examId);

  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Exam not found</p>
      </div>
    );
  }

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  };

  const submitExam = () => {
    let correctCount = 0;
    let wrongCount = 0;

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer !== undefined) {
        if (userAnswer === q.answer_idx) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    const totalMark = correctCount * 1 + wrongCount * -0.25;

    sessionStorage.setItem(
      `exam_result_${examId}`,
      JSON.stringify({
        correctCount,
        wrongCount,
        skipped: questions.length - Object.keys(answers).length,
        totalMark: totalMark.toFixed(2),
        answers,
      })
    );

    router.push(`/exam/mcq/result/${examId}`);
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
    const element = document.getElementById(`question-${index}`);
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
              initialSeconds={exam.duration_minutes * 60}
              onTimeUp={submitExam}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* All Questions Panel */}
          <div className="lg:col-span-3 space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} id={`question-${index}`}>
                <QuestionCard
                  questionNumber={index + 1}
                  content={question.content}
                  options={question.options}
                  selectedAnswer={answers[question.id]}
                  onAnswerSelect={(optionIndex) =>
                    handleAnswerSelect(question.id, optionIndex)
                  }
                />
              </div>
            ))}

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
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => scrollToQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      answers[q.id] !== undefined
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
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