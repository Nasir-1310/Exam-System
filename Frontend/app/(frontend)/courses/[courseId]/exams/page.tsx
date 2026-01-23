"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Pagination from "@/components/Pagination";

interface Exam {
  id: number;
  title: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  mark: number;
  minus_mark: number;
  is_free: boolean;
  price: number | null;
  questions: any[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  is_free: boolean;
}

// Auth/Subscription Popup
function ActionPopup({ isOpen, onClose, type, exam, course, onLogin, onRegister }: any) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          {type === "subscription" ? (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Subscription Required
              </h2>
              <p className="text-gray-600 mb-4">
                This is a premium exam. Subscribe to access.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{exam?.title}</strong>
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ৳{exam?.price || course?.price}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Login Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please login or register to take this exam.
              </p>
            </>
          )}
        </div>
        
        {type === "subscription" ? (
          <div className="flex gap-4">
            <button
              onClick={() => alert("Payment system coming soon!")}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Subscribe Now
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={onLogin}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Login
            </button>
            <button
              onClick={onRegister}
              className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Exam Card
function ExamCard({ exam, course, onStartExam }: any) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 flex-1">
            {exam.title}
          </h3>
          {exam.is_free ? (
            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              FREE
            </span>
          ) : (
            <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              PREMIUM
            </span>
          )}
        </div>

        {exam.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {exam.description}
          </p>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Duration
            </span>
            <span className="font-semibold text-gray-900">
              {exam.duration_minutes} min
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Questions
            </span>
            <span className="font-semibold text-gray-900">
              {exam.questions?.length || 0}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Total Marks
            </span>
            <span className="font-semibold text-gray-900">
              {exam.mark}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Negative
            </span>
            <span className="font-semibold text-red-600">
              -{exam.minus_mark}
            </span>
          </div>

          {!exam.is_free && exam.price && (
            <div className="flex items-center justify-between text-sm pt-2 border-t">
              <span className="text-gray-600">Price</span>
              <span className="font-bold text-blue-600">৳{exam.price}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => onStartExam(exam)}
          disabled={!exam.questions || exam.questions.length === 0}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
            exam.questions && exam.questions.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {exam.questions && exam.questions.length > 0
            ? exam.is_free
              ? "Start Free Exam"
              : "Start Premium Exam"
            : "No Questions Available"}
        </button>
      </div>
    </div>
  );
}

// Main Page
export default function CourseExamsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [popup, setPopup] = useState({ isOpen: false, type: "", exam: null });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const examsPerPage = 8;

  useEffect(() => {
    checkAuth();
    fetchCourseAndExams();
  }, [courseId]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  const fetchCourseAndExams = async () => {
    try {
      setLoading(true);
      
      const courseResponse = await fetch(`http://localhost:8000/api/courses/${courseId}`);
      const courseData = await courseResponse.json();
      setCourse(courseData);

      const examsResponse = await fetch(`http://localhost:8000/api/courses/${courseId}/exams`);
      const examsData = await examsResponse.json();
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(exams.length / examsPerPage);
  const displayedExams = exams.slice(
    (currentPage - 1) * examsPerPage,
    currentPage * examsPerPage
  );

  const handleStartExam = (exam: Exam) => {
    // Logic:
    // 1. Free course + Free exam = Anyone can take (no login)
    // 2. Free course + Paid exam = Need subscription
    // 3. Paid course + Free exam = Need login (registered users)
    // 4. Paid course + Paid exam = Need subscription

    const isCourseFrere = course?.is_free;
    const isExamFree = exam.is_free;

    // Case 1: Free course + Free exam = Direct access
    if (isCourseFrere && isExamFree) {
      router.push(`/exam/${exam.id}`);
      return;
    }

    // Case 2 & 4: Paid exam = Need subscription
    if (!isExamFree) {
      setPopup({ isOpen: true, type: "subscription", exam });
      return;
    }

    // Case 3: Paid course + Free exam = Need login
    if (!isCourseFrere && isExamFree) {
      if (!isLoggedIn) {
        setPopup({ isOpen: true, type: "login", exam });
      } else {
        router.push(`/exam/${exam.id}`);
      }
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading exams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Courses
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {course?.title}
              </h1>
              <p className="text-gray-600">
                {course?.description || "All exams for this course"}
              </p>
            </div>
            {!course?.is_free && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Course Price</p>
                <p className="text-3xl font-bold text-blue-600">৳{course?.price}</p>
              </div>
            )}
          </div>
        </div>

        {displayedExams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Exams Available
            </h3>
            <p className="text-gray-600 mb-4">
              There are no exams available for this course yet.
            </p>
            <button
              onClick={() => router.push("/courses")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Other Courses
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  course={course}
                  onStartExam={handleStartExam}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <ActionPopup
        isOpen={popup.isOpen}
        onClose={() => setPopup({ isOpen: false, type: "", exam: null })}
        type={popup.type}
        exam={popup.exam}
        course={course}
        onLogin={() => router.push("/login")}
        onRegister={() => router.push("/register")}
      />
    </div>
  );
}