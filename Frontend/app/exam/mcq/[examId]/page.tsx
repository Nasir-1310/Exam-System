// Frontend/app/exam/mcq/[examId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import { Exam, Question, Answer } from '@/lib/types';
import QuestionCard from '@/components/exam/QuestionCard';
import Timer from '@/components/exam/Timer';
import Swal from 'sweetalert2';

export default function MCQExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.examId as string);

  const [exam, setExam] = useState<Exam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Map<number, Answer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const fetchedExam = await apiService.getExamById(examId);
        setExam(fetchedExam);

        if (!fetchedExam.is_active) {
          Swal.fire({
            icon: 'error',
            title: 'Exam Not Available',
            text: 'This exam is not active.',
            confirmButtonText: 'Go Back',
          }).then(() => {
            router.push('/exam');
          });
          return;
        }

        if (new Date(fetchedExam.start_time) > new Date()) {
          Swal.fire({
            icon: 'error',
            title: 'Exam Not Started',
            text: 'This exam has not started yet.',
            confirmButtonText: 'Go Back',
          }).then(() => {
            router.push('/exam');
          });
          return;
        }
        timerRef.current?.start(); // Start the timer here

      } catch (err: any) {
        setError(err.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to fetch exam.',
          confirmButtonText: 'Go Back',
        }).then(() => {
          router.back();
        });
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchExam();
    }
  }, [examId, router]);

  const handleAnswerChange = (questionId: number, selectedOption: number | null, submittedAnswerText: string | null = null) => {
    setUserAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, { question_id: questionId, selected_option: selectedOption, submitted_answer_text: submittedAnswerText });
      return newAnswers;
    });
  };


  const handleSubmitExam = async () => {
    const unansweredCount = exam.questions.length - answeredQuestions;

    const confirmText = unansweredCount > 0
      ? `আপনি ${unansweredCount}টি প্রশ্নের উত্তর দেননি। এগিয়ে যেতে চান?`
      : "আপনি কি নিশ্চিত যে পরীক্ষা জমা দিতে চান?";

    Swal.fire({
      title: 'নিশ্চিত করুন',
      text: confirmText,
      icon: unansweredCount > 0 ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'হ্যাঁ, জমা দিন',
      cancelButtonText: 'বাতিল'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const answersArray = Array.from(userAnswers.values());
          const resultData = await apiService.submitExam(examId, answersArray);
          Swal.fire(
            'জমা হয়েছে!',
            'আপনার পরীক্ষা সফলভাবে জমা হয়েছে।',
            'success'
          );
          router.push(`/exam/mcq/result/${examId}`);
        } catch (err: any) {
          setError(err.message);
          Swal.fire({
            icon: 'error',
            title: 'জমা করা ব্যর্থ',
            text: err.message || 'পরীক্ষা জমা করতে ব্যর্থ।',
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading exam...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">Error: {error}</div>;
  }

  if (!exam || exam.questions.length === 0) {
    return <div className="container mx-auto p-4 text-center">No exam or questions found.</div>;
  }

  const answeredQuestions = exam.questions.filter(q => userAnswers.has(q.id)).length;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">{exam.title}</h1>
        <p className="text-gray-600 text-center mb-8">{exam.description}</p>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">পরীক্ষা প্রশ্নসমূহ</h2>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                উত্তর দেওয়া: {answeredQuestions}/{exam.questions.length}
              </span>
            </div>
            {exam.duration_minutes > 0 && (
              <Timer
                duration={exam.duration_minutes * 60} // Convert minutes to seconds
                onTimeUp={handleSubmitExam}
                ref={timerRef}
              />
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(answeredQuestions / exam.questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {Math.round((answeredQuestions / exam.questions.length) * 100)}% সম্পন্ন
          </p>

          {/* Question Navigation */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">প্রশ্ন নেভিগেশন:</p>
            <div className="flex flex-wrap gap-2">
              {exam.questions.map((question, index) => {
                const isAnswered = userAnswers.has(question.id);
                return (
                  <button
                    key={question.id}
                    onClick={() => {
                      const element = document.getElementById(`question-${question.id}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      isAnswered
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {exam.questions.map((question, index) => {
            const selectedAnswer = userAnswers.get(question.id);
            return (
              <div key={question.id} id={`question-${question.id}`} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{question.content}</h3>
                    <QuestionCard
                      question={question}
                      selectedOption={selectedAnswer?.selected_option}
                      submittedAnswerText={selectedAnswer?.submitted_answer_text}
                      onAnswerChange={(selectedOption, submittedAnswerText) =>
                        handleAnswerChange(question.id, selectedOption, submittedAnswerText)
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmitExam}
            className="px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-lg shadow-lg"
          >
            পরীক্ষা জমা দিন
          </button>
        </div>
      </div>
    </div>
  );
}
