// app/exam/mcq/result/[examId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getExamById, getQuestionsByExamId } from "@/lib/mockExamData";
import ResultSummary from "@/components/exam/ResultSummary";

interface ExamResult {
  correctCount: number;
  wrongCount: number;
  skipped: number;
  totalMark: string;
  answers: { [key: number]: number };
}

export default function MCQExamResultPage() {
  const params = useParams();
  const examId = parseInt(params.examId as string);
  const [result, setResult] = useState<ExamResult | null>(null);

  const exam = getExamById(examId);
  const questions = getQuestionsByExamId(examId);

  useEffect(() => {
    const storedResult = sessionStorage.getItem(`exam_result_${examId}`);
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
  }, [examId]);

  if (!exam || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading result...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Result Summary Component */}
        <ResultSummary
          totalMark={result.totalMark}
          totalMarks={exam.total_marks}
          correctCount={result.correctCount}
          wrongCount={result.wrongCount}
          skipped={result.skipped}
          examTitle={exam.title}
        />

        {/* Answer Review */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Answer Review
          </h2>

          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = result.answers[question.id];
              const isCorrect = userAnswer === question.answer_idx;
              const isSkipped = userAnswer === undefined;

              return (
                <div
                  key={question.id}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    isSkipped
                      ? "border-gray-400 bg-gray-50"
                      : isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-gray-900">
                      {index + 1}. {question.content}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                        isSkipped
                          ? "bg-gray-200 text-gray-700"
                          : isCorrect
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {isSkipped ? "SKIPPED" : isCorrect ? "CORRECT" : "WRONG"}
                    </span>
                  </div>

                  <div className="space-y-2 ml-4">
                    {question.options.map((option, optIdx) => {
                      const isUserAnswer = userAnswer === optIdx;
                      const isCorrectAnswer = question.answer_idx === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`p-2 rounded ${
                            isCorrectAnswer
                              ? "bg-green-200 font-medium"
                              : isUserAnswer
                              ? "bg-red-200"
                              : "bg-white"
                          }`}
                        >
                          <span className="font-medium mr-2 text-gray-900">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="text-gray-900">{option}</span>
                          {isCorrectAnswer && (
                            <span className="ml-2 text-green-700 font-bold">
                              ✓ Correct Answer
                            </span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="ml-2 text-red-700 font-bold">
                              ✗ Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/exam/mcq"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Back to MCQ Exams
          </Link>
          <Link
            href={`/exam/mcq/${examId}`}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
          >
            Retake Exam
          </Link>
        </div>
      </div>
    </div>
  );
}