// Frontend/app/exam/mcq/[examId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import { ResultDetailed, Exam, Question, AnswerDetail } from '@/lib/types';
import ResultSummary from '@/components/exam/ResultSummary';
import QuestionResult from '@/components/exam/QuestionResult';
import Swal from 'sweetalert2';

export default function MCQExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.examId as string);

  const [result, setResult] = useState<ResultDetailed | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const fetchedResult = await apiService.getDetailedExamResult(examId);
        setResult(fetchedResult);

        // Also fetch exam details to display title and other info
        const fetchedExam = await apiService.getExamById(examId);
        setExam(fetchedExam);

      } catch (err: any) {
        setError(err.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to fetch result.',
          confirmButtonText: 'Go Back',
        }).then(() => {
          router.back();
        });
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchResult();
    }
  }, [examId, router]);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading result...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">Error: {error}</div>;
  }

  if (!result || !exam) {
    return <div className="container mx-auto p-4 text-center">No result found for this exam.</div>;
  }

  // Check if exam has no questions
  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Result for {exam.title}</h1>

          <ResultSummary result={result} exam={exam} />

          <div className="bg-white rounded-lg shadow-md p-8 mt-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">প্রশ্ন যোগ করা হচ্ছে</h3>
            <p className="text-gray-600">এই পরীক্ষায় এখনো কোনো প্রশ্ন যোগ করা হয়নি। শীঘ্রই প্রশ্ন যোগ করা হবে।</p>
          </div>
        </div>
      </div>
    );
  }

  const isDetailedResultsVisible = exam.show_detailed_results_after ? new Date() >= new Date(exam.show_detailed_results_after) : false; // Default to false if not set

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Result for {exam.title}</h1>

        <ResultSummary result={result} exam={exam} />

        {isDetailedResultsVisible && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">প্রশ্নের বিস্তারিত উত্তর</h2>
                <button
                  onClick={() => setShowDetailedResults(!showDetailedResults)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showDetailedResults ? 'সারাংশ দেখুন' : 'বিস্তারিত দেখুন'}
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {showDetailedResults
                  ? 'সব প্রশ্নের বিস্তারিত উত্তর এবং ব্যাখ্যা দেখতে পারবেন'
                  : 'প্রশ্নের সারাংশ দেখতে বিস্তারিত বাটন ক্লিক করুন'
                }
              </p>
            </div>

            {showDetailedResults && (
              <div className="space-y-4">
                {exam.questions.map((question, index: number) => {
                  const answerDetail = result.answers_details.find(a => a.question_id === question.id);

                  // Create a placeholder answer detail for skipped questions
                  const displayAnswerDetail: AnswerDetail = answerDetail || {
                    id: -1,
                    question_id: question.id,
                    exam_id: exam.id,
                    result_id: result.id,
                    selected_option: null,
                    submitted_answer_text: null,
                    is_correct: false,
                    correct_option_index: question.answer_idx || 0,
                    marks_obtained: 0
                  };

                  return (
                    <QuestionResult
                      key={question.id}
                      answerDetail={displayAnswerDetail}
                      question={question}
                      showDetails={showDetailedResults}
                      isSkipped={!answerDetail}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!isDetailedResultsVisible && exam.show_detailed_results_after && (
          <div className="bg-white rounded-lg shadow-md p-8 mt-8 text-center text-gray-700">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">বিস্তারিত ফলাফল এখনো উপলব্ধ নয়</h3>
            <p className="text-gray-600">
              বিস্তারিত ফলাফল দেখা যাবে {new Date(exam.show_detailed_results_after).toLocaleString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
