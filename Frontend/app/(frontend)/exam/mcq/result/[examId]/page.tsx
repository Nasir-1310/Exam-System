// Frontend/app/exam/mcq/[examId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import { ResultDetailed, Exam, Question, AnswerDetail } from '@/lib/types';
import ResultSummary from '@/components/exam/ResultSummary';
import QuestionResult from '@/components/exam/QuestionResult';
import MathContentRenderer from '@/components/editor/MathContentRenderer'; // ADD THIS IMPORT
import Swal from 'sweetalert2';

export default function MCQExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.examId as string);

  const [result, setResult] = useState<ResultDetailed | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : "";
        const anonStr =
          typeof window !== "undefined"
            ? localStorage.getItem("anonymous_user")
            : null;

        let fetchedResult: ResultDetailed | null = null;

        if (token) {
          fetchedResult = await apiService.getDetailedExamResult(examId);
        } else if (anonStr) {
          const anon = JSON.parse(anonStr) as { email?: string };
          if (!anon.email) {
            throw new Error("Not authenticated");
          }
          fetchedResult = await apiService.getDetailedExamResultAnonymous(
            examId,
            anon.email,
          );
        } else {
          throw new Error("Not authenticated");
        }

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
      <div className="min-h-screen bg-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">{exam.title}</h1>
          
          {/* ADDED: Display exam description if available */}
          {exam.description && (
            <MathContentRenderer 
              content={exam.description}
              className="text-gray-600 text-center mb-8"
            />
          )}

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

  const isDetailedResultsVisible = !exam.show_detailed_results_after || new Date() >= new Date(exam.show_detailed_results_after);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 py-10 mt-12">
      <div className="mx-auto w-full max-w-6xl px-4 space-y-6">
        <div className="flex flex-col gap-3 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.14em]">MCQ Result</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{exam.title}</h1>
          {exam.description && (
            <MathContentRenderer 
              content={exam.description}
              className="text-slate-600 text-base md:text-lg max-w-4xl mx-auto"
            />
          )}
        </div>

        <ResultSummary result={result} exam={exam} />

        {isDetailedResultsVisible ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-4 md:p-5">
              <div className="text-left">
                <h2 className="text-xl font-semibold text-slate-900">প্রশ্ন ও উত্তর</h2>
                <p className="text-slate-600 text-sm mt-1">
                  {showDetailedResults
                    ? 'প্রতিটি প্রশ্নের নির্বাচিত উত্তর ও সঠিক উত্তর দেখানো হচ্ছে'
                    : 'বাটনে ক্লিক করে সঠিক/ভুল মার্কিংসহ বিস্তারিত দেখুন'}
                </p>
              </div>
              <button
                onClick={() => setShowDetailedResults(!showDetailedResults)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white hover:border-slate-400 transition-colors"
              >
                {showDetailedResults ? 'শুধু সারাংশ' : 'বিস্তারিত দেখুন'}
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              {exam.questions.map((question, index: number) => {
                const answerDetail = result.answers_details.find(a => a.question_id === question.id);

                const resolveCorrectIndex = () => {
                  const raw = (question as any).answer as string | undefined;
                  if (!raw) return null;
                  const normalized = raw.trim().toUpperCase();
                  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
                  if (normalized in map) return map[normalized];
                  const maybeNumber = Number(normalized);
                  if (!Number.isNaN(maybeNumber) && maybeNumber >= 1 && maybeNumber <= 4) {
                    return maybeNumber - 1;
                  }
                  return null;
                };

                // Create a placeholder answer detail for skipped questions
                const displayAnswerDetail: AnswerDetail = answerDetail || {
                  id: -1,
                  question_id: question.id,
                  exam_id: exam.id,
                  result_id: result.id,
                  selected_option: null,
                  submitted_answer_text: null,
                  is_correct: false,
                  correct_option_index: resolveCorrectIndex(),
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
          </div>
        ) : (
          exam.show_detailed_results_after && (
            <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-8 mt-2 text-center text-slate-700">
              <svg className="w-14 h-14 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">বিস্তারিত ফলাফল এখনো উপলব্ধ নয়</h3>
              <p className="text-slate-600">
                বিস্তারিত ফলাফল দেখা যাবে {new Date(exam.show_detailed_results_after).toLocaleString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}