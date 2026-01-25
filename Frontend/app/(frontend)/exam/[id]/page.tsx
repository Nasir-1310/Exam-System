// Frontend/app/(frontend)/exam/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import QuestionCard from "@/components/exam/QuestionCard";
import ExamHeader from "@/components/exam/ExamHeader";
import { TimerRef } from "@/components/exam/Timer";
import MathContentRenderer from "@/components/editor/MathContentRenderer";

interface Question {
  id: number;
  content: string;
  image_url?: string;
  options?: string[];
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_a_image_url?: string;
  option_b_image_url?: string;
  option_c_image_url?: string;
  option_d_image_url?: string;
  q_type: string;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  questions: Question[];
  allow_multiple_attempts: boolean;
  is_active: boolean;
  start_time: string;
  end_time: string;
  result_announcement_time?: string;
  is_free: boolean;
  requires_premium: boolean;
}

interface Answer {
  question_id: number;
  selected_option: number | null;
  submitted_answer_text: string | null;
}

// Exit Confirmation Dialog
function ExitConfirmDialog({ isOpen, onClose, onConfirm }: any) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] px-4">
      <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">পরীক্ষা ছেড়ে যেতে চান?</h2>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            পরীক্ষা থেকে বের হলে স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে এবং আপনি আর ফিরে আসতে পারবেন না।
          </p>
        </div>
        
        <div className="flex gap-3 md:gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm md:text-base"
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm md:text-base"
          >
            জমা দিন
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params?.id as string);
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef<TimerRef>(null);

  useEffect(() => {
    fetchExam();
    return () => {
      timerRef.current?.stop();
    };
  }, [examId]);

  // Handle browser back button and page unload
  useEffect(() => {
    if (!hasStarted) return;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'আপনার পরীক্ষা এখনও চলছে। পেজ ছাড়লে স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।';
    };
    
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setShowExitDialog(true);
      window.history.pushState(null, '', window.location.href);
    };
    
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasStarted]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'লগইন প্রয়োজন',
          text: 'পরীক্ষা দিতে লগইন করুন',
          confirmButtonText: 'লগইন করুন'
        }).then(() => router.push('/login'));
        return;
      }

      const response = await fetch(`http://localhost:8000/api/exams/${examId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch exam');
      
      const data = await response.json();
      
      // Check if exam is active
      if (!data.is_active) {
        Swal.fire({
          icon: 'error',
          title: 'পরীক্ষা বন্ধ',
          text: 'এই পরীক্ষা বর্তমানে সক্রিয় নয়।',
          confirmButtonText: 'ফিরে যান'
        }).then(() => router.push('/courses'));
        return;
      }

      // Check if exam has started
      if (new Date(data.start_time) > new Date()) {
        Swal.fire({
          icon: 'info',
          title: 'পরীক্ষা শুরু হয়নি',
          text: 'এই পরীক্ষা এখনও শুরু হয়নি।',
          confirmButtonText: 'ফিরে যান'
        }).then(() => router.push('/courses'));
        return;
      }

      // Check if exam has ended
      if (new Date(data.end_time) < new Date()) {
        Swal.fire({
          icon: 'error',
          title: 'পরীক্ষা শেষ',
          text: 'এই পরীক্ষার সময় শেষ হয়ে গেছে।',
          confirmButtonText: 'ফিরে যান'
        }).then(() => router.push('/courses'));
        return;
      }

      // Check premium requirement
      if (data.requires_premium) {
        const userResponse = await fetch('http://localhost:8000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userResponse.json();
        
        if (!userData.is_premium) {
          Swal.fire({
            icon: 'warning',
            title: 'প্রিমিয়াম প্রয়োজন',
            text: 'এই পরীক্ষা দিতে প্রিমিয়াম সদস্যপদ প্রয়োজন।',
            confirmButtonText: 'আপগ্রেড করুন'
          }).then(() => router.push('/pricing'));
          return;
        }
      }
      
      // Check if already attempted
      const attemptResponse = await fetch(
        `http://localhost:8000/api/exams/${examId}/check-attempt`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (attemptResponse.ok) {
        const attemptData = await attemptResponse.json();
        if (attemptData.has_attempted && !data.allow_multiple_attempts) {
          Swal.fire({
            icon: 'info',
            title: 'ইতিমধ্যে দেওয়া হয়েছে',
            text: 'আপনি ইতিমধ্যে এই পরীক্ষা দিয়েছেন।',
            confirmButtonText: 'ফলাফল দেখুন'
          }).then(() => router.push(`/exam/result/${examId}`));
          return;
        }
      }
      
      setExam(data);
      setHasStarted(true);
      
      // Start timer
      setTimeout(() => {
        timerRef.current?.start();
      }, 100);
      
    } catch (error) {
      console.error('Error fetching exam:', error);
      Swal.fire('ত্রুটি', 'পরীক্ষা লোড করতে ব্যর্থ', 'error');
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (
    questionId: number,
    selectedOption: number | null,
    submittedAnswerText: string | null = null,
  ) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, {
        question_id: questionId,
        selected_option: selectedOption,
        submitted_answer_text: submittedAnswerText,
      });
      return newAnswers;
    });
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;
    
    timerRef.current?.stop();
    
    if (!autoSubmit) {
      const unansweredCount = exam!.questions.length - answers.size;
      const result = await Swal.fire({
        title: 'নিশ্চিত করুন',
        text: unansweredCount > 0 
          ? `আপনি ${unansweredCount}টি প্রশ্নের উত্তর দেননি। জমা দিতে চান?`
          : 'আপনি কি পরীক্ষা জমা দিতে চান?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'হ্যাঁ, জমা দিন',
        cancelButtonText: 'বাতিল',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      });
      
      if (!result.isConfirmed) {
        timerRef.current?.start();
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const answersArray = Array.from(answers.values());
      
      const timeSpent = (exam!.duration_minutes * 60) - (timerRef.current?.getTimeLeft() || 0);
      
      const response = await fetch(`http://localhost:8000/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          answers: answersArray,
          time_spent: Math.floor(timeSpent)
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit exam');
      
      await Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'পরীক্ষা সফলভাবে জমা হয়েছে',
        confirmButtonText: 'ফলাফল দেখুন'
      });
      
      router.push(`/exam/result/${examId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      Swal.fire('ব্যর্থ', 'পরীক্ষা জমা করতে ব্যর্থ', 'error');
      timerRef.current?.start();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">পরীক্ষা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!exam) return null;

  const answeredQuestions = exam.questions.filter((q) => answers.has(q.id)).length;
  const timeLeft = timerRef.current?.getTimeLeft() || 0;
  const isExpired = timeLeft === 0;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Sticky Timer Header */}
      <ExamHeader
        duration={exam.duration_minutes * 60}
        onTimeUp={() => handleSubmit(true)}
        timerRef={timerRef}
        isExpired={isExpired}
      />
      
      <div className="container  mx-auto px-4 max-w-4xl pt-30">
        {/* Exam Title and Description */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          {exam.title}
        </h1>
        <MathContentRenderer 
          content={exam.description}
          className="text-gray-600 text-center mb-8"
        />

        {/* Exam Stats Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl text-black font-semibold">পরীক্ষা প্রশ্নসমূহ</h2>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                উত্তর দেওয়া: {answeredQuestions}/{exam.questions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${(answeredQuestions / exam.questions.length) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {Math.round((answeredQuestions / exam.questions.length) * 100)}% সম্পন্ন
          </p>

          {/* Question Navigation */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              প্রশ্ন নেভিগেশন:
            </p>
            <div className="flex flex-wrap gap-2">
              {exam.questions.map((question, index) => {
                const isAnswered = answers.has(question.id);
                return (
                  <button
                    key={question.id}
                    onClick={() => {
                      const element = document.getElementById(
                        `question-${question.id}`,
                      );
                      element?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      isAnswered
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {exam.questions.map((question, index) => {
            const selectedAnswer = answers.get(question.id);
            return (
              <div
                key={question.id}
                id={`question-${question.id}`}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    {/* Question Content */}
                    <div className="mb-4">
                      {question.content && (
                        <MathContentRenderer 
                          content={question.content}
                          className="text-lg font-medium text-gray-900 mb-4"
                        />
                      )}
                    </div>

                    {/* Question Card with Options */}
                    <QuestionCard
                      question={question}
                      selectedOption={selectedAnswer?.selected_option}
                      submittedAnswerText={selectedAnswer?.submitted_answer_text}
                      onAnswerChange={(selectedOption, submittedAnswerText) =>
                        handleAnswerChange(
                          question.id,
                          selectedOption,
                          submittedAnswerText,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'জমা হচ্ছে...' : 'পরীক্ষা জমা দিন'}
          </button>
        </div>
      </div>

      <ExitConfirmDialog
        isOpen={showExitDialog}
        onClose={() => {
          setShowExitDialog(false);
          window.history.pushState(null, '', window.location.href);
        }}
        onConfirm={() => handleSubmit(true)}
      />
    </div>
  );
}