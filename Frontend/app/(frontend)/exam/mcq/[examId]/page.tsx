// Frontend/app/exam/mcq/[examId]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import apiService from "@/lib/api";
import { Exam, Question, Answer } from "@/lib/types";
import QuestionCard from "@/components/exam/QuestionCard";
import Timer from "@/components/exam/Timer";
import { convertGoogleDriveUrl } from "@/lib/googleDriveUtils";
import MathContentRenderer from "@/components/editor/MathContentRenderer"; // ADD THIS IMPORT
import { getBrowserToken } from "@/lib/authToken";
import Swal from "sweetalert2";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function MCQExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.examId as string);

  const [exam, setExam] = useState<Exam | null>(null);
  const [userAnswers, setUserAnswers] = useState<Map<number, Answer>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnonModal, setShowAnonModal] = useState(false);
  const [anonForm, setAnonForm] = useState({ name: "", email: "", active_mobile: "" });
  const [anonSubmitting, setAnonSubmitting] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const timerRef = useRef<any>(null);

  const answeredQuestions = exam?.questions
    ? exam.questions.filter((q) => userAnswers.has(q.id)).length
    : 0;

  useEffect(() => {
    setHasToken(!!getBrowserToken());

    const fetchExam = async () => {
      try {
        setLoading(true);
        const fetchedExam = await apiService.getExamById(examId);
        setExam(fetchedExam);

        if (!fetchedExam.is_active) {
          Swal.fire({
            icon: "error",
            title: "Exam Not Available",
            text: "This exam is not active.",
            confirmButtonText: "Go Back",
          }).then(() => {
            router.push("/exam");
          });
          return;
        }

        if (new Date(fetchedExam.start_time) > new Date()) {
          Swal.fire({
            icon: "error",
            title: "Exam Not Started",
            text: "This exam has not started yet.",
            confirmButtonText: "Go Back",
          }).then(() => {
            router.push("/exam");
          });
          return;
        }
        // If already authenticated, start immediately; otherwise show modal first
        if (getBrowserToken()) {
          setExamStarted(true);
        } else {
          setShowAnonModal(true);
        }
      } catch (err: any) {
        setError(err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to fetch exam.",
          confirmButtonText: "Go Back",
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

  // Start timer when exam is allowed to start (logged-in or anon form submitted)
  useEffect(() => {
    if (exam && examStarted && exam.duration_minutes > 0) {
      timerRef.current?.start();
    }
  }, [exam, examStarted]);

  const handleAnswerChange = (
    questionId: number,
    selectedOption: number | null,
    submittedAnswerText: string | null = null,
  ) => {
    setUserAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, {
        question_id: questionId,
        selected_option: selectedOption ?? undefined,
        submitted_answer_text: submittedAnswerText ?? undefined,
      });
      return newAnswers;
    });
  };

  const handleSubmitExam = async () => {
    if (!exam) return;
    const token = getBrowserToken();
    if (!token) {
      // Require anon info before submitting
      if (!anonForm.name.trim() || !anonForm.email.trim()) {
        setShowAnonModal(true);
        return;
      }
      await submitAnonymousExam();
      return;
    }

    const unansweredCount = exam.questions.length - answeredQuestions;

    const confirmText =
      unansweredCount > 0
        ? `আপনি ${unansweredCount}টি প্রশ্নের উত্তর দেননি। এগিয়ে যেতে চান?`
        : "আপনি কি নিশ্চিত যে পরীক্ষা জমা দিতে চান?";

    Swal.fire({
      title: "নিশ্চিত করুন",
      text: confirmText,
      icon: unansweredCount > 0 ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "হ্যাঁ, জমা দিন",
      cancelButtonText: "বাতিল",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const answersArray = Array.from(userAnswers.values());
          const res = await fetch(`${API_BASE}/api/exams/${examId}/submit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: JSON.stringify(answersArray),
          });

          if (res.status === 401) {
            Swal.fire({
              icon: "warning",
              title: "লগইন প্রয়োজন",
              text: "পরীক্ষা জমা দিতে লগইন করুন।",
              confirmButtonText: "লগইন",
            }).then(() => {
              router.push(`/auth/login?next=${encodeURIComponent(window.location.href)}`);
            });
            return;
          }

          if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "পরীক্ষা জমা করতে ব্যর্থ।");
          }

          await res.json();
          Swal.fire(
            "জমা হয়েছে!",
            "আপনার পরীক্ষা সফলভাবে জমা হয়েছে।",
            "success",
          );
          // Always navigate with the examId since the result page expects examId (it fetches the latest result for the exam)
          router.push(`/exam/mcq/result/${examId}`);
        } catch (err: any) {
          setError(err.message);
          Swal.fire({
            icon: "error",
            title: "জমা করা ব্যর্থ",
            text: err.message || "পরীক্ষা জমা করতে ব্যর্থ।",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const submitAnonymousExam = async () => {
    if (!exam) return;
    if (!anonForm.name.trim() || !anonForm.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "তথ্য প্রয়োজন",
        text: "নাম এবং ইমেইল দিন।",
      });
      return;
    }

    const unansweredCount = exam.questions.length - answeredQuestions;
    const confirmText =
      unansweredCount > 0
        ? `আপনি ${unansweredCount}টি প্রশ্নের উত্তর দেননি। এগিয়ে যেতে চান?`
        : "আপনি কি নিশ্চিত যে পরীক্ষা জমা দিতে চান?";

    const confirmation = await Swal.fire({
      title: "নিশ্চিত করুন",
      text: confirmText,
      icon: unansweredCount > 0 ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "হ্যাঁ, জমা দিন",
      cancelButtonText: "বাতিল",
    });

    if (!confirmation.isConfirmed) return;

    try {
      setAnonSubmitting(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("anonymous_user", JSON.stringify(anonForm));
      }
      const answersArray = Array.from(userAnswers.values());
      const res = await fetch(`${API_BASE}/api/exams/${examId}/submit/anonymous`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: anonForm.name,
          email: anonForm.email,
          active_mobile: anonForm.active_mobile,
          answers: answersArray,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "পরীক্ষা জমা করতে ব্যর্থ।");
      }

      await res.json();
      setShowAnonModal(false);
      setExamStarted(true);
      Swal.fire(
        "জমা হয়েছে!",
        "আপনার পরীক্ষা সফলভাবে জমা হয়েছে।",
        "success",
      );
      router.push(`/exam/mcq/result/${examId}`);
    } catch (err: any) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "জমা করা ব্যর্থ",
        text: err.message || "পরীক্ষা জমা করতে ব্যর্থ।",
      });
    } finally {
      setAnonSubmitting(false);
    }
  };

  const handleAnonStart = async () => {
    if (!exam) return;
    if (!anonForm.name.trim() || !anonForm.email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "তথ্য প্রয়োজন",
        text: "নাম এবং ইমেইল দিন।",
      });
      return;
    }
    setShowAnonModal(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("anonymous_user", JSON.stringify(anonForm));
    }
    setExamStarted(true);
  };

  // ============================================================================
  // FIXED: Helper function to get proper image source URL
  // ============================================================================
  const getImageSrc = (imageUrl: string): string => {
    if (!imageUrl) return "";

    // If it's already a full URL (http:// or https://)
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      // Check if it's a Google Drive URL - convert it
      if (imageUrl.includes("drive.google.com")) {
        return convertGoogleDriveUrl(imageUrl);
      }
      // Backend URL or other external URL - use as-is
      return imageUrl;
    }

    // If it's a relative path starting with /uploads/ (shouldn't happen now)
    if (imageUrl.startsWith("/uploads/")) {
      return `http://127.0.0.1:8000${imageUrl}`;
    }

    // Local path from public folder (/questions/...)
    if (imageUrl.startsWith("/questions/") || imageUrl.startsWith("/")) {
      return imageUrl;
    }

    // If it contains drive.google.com but no protocol
    if (imageUrl.includes("drive.google.com")) {
      return convertGoogleDriveUrl(`https://${imageUrl}`);
    }

    // Default: return as-is
    return imageUrl;
  };

  // ============================================================================
  // FIXED: Helper function to check if text is an image URL
  // ============================================================================
  const isImageUrl = (text: string): boolean => {
    if (!text) return false;

    // Check if it's a full URL
    if (text.startsWith("http://") || text.startsWith("https://")) {
      return true;
    }

    // Check if it starts with /uploads/ or /questions/
    if (text.startsWith("/uploads/") || text.startsWith("/questions/")) {
      return true;
    }

    // Check if it contains drive.google.com
    if (text.includes("drive.google.com")) {
      return true;
    }

    return false;
  };

  // ============================================================================
  // FIXED: Render question image helper
  // ============================================================================
  const renderQuestionImage = (
    imageUrl: string,
    altText: string = "Question Image",
  ) => {
    const imageSrc = getImageSrc(imageUrl);

    return (
      <img
        src={imageSrc}
        alt={altText}
        className="w-full max-w-2xl h-auto max-h-96 object-contain border-2 border-gray-300 rounded-xl shadow-lg mx-auto block"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiByeD0iMTIiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTIwMCA4MFYyMDBNMTEyIDEyMEgyODgiIHN0cm9rZT0iIzlDQTQ5RiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHRleHQgeD0iMjAwIiB5PSIxNDAiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPg==";
          target.alt = "Image failed to load";
          console.warn("Image failed to load:", imageUrl);
        }}
        loading="lazy"
      />
    );
  };
  // ============================================================================

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">Loading exam...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500 text-center">
        Error: {error}
      </div>
    );
  }

  if (!exam || exam.questions.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        No exam or questions found.
      </div>
    );
  }

  return (
    <>
      {showAnonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">অতিথি হিসেবে পরীক্ষা শুরু করুন</h3>
                <p className="text-sm text-gray-600">পরীক্ষা শুরু করার আগে নাম ও ইমেইল দিন।</p>
              </div>
              <button
                onClick={() => setShowAnonModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">নাম *</label>
                <input
                  type="text"
                  value={anonForm.name}
                  onChange={(e) => setAnonForm({ ...anonForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="আপনার নাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ইমেইল *</label>
                <input
                  type="email"
                  value={anonForm.email}
                  onChange={(e) => setAnonForm({ ...anonForm, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="example@mail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">মোবাইল</label>
                <input
                  type="tel"
                  value={anonForm.active_mobile}
                  onChange={(e) => setAnonForm({ ...anonForm, active_mobile: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="১১ ডিজিট মোবাইল"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAnonModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={anonSubmitting}
              >
                বাতিল
              </button>
              <button
                onClick={handleAnonStart}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
                disabled={anonSubmitting}
              >
                {anonSubmitting ? "প্রস্তুত হচ্ছে..." : "পরীক্ষা শুরু"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl mt-14">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          {exam.title}
        </h1>
        {/* UPDATED: Use MathContentRenderer for exam description */}
        <MathContentRenderer 
          content={exam.description}
          className="text-gray-600 text-center mb-4"
        />

        <div className="bg-white p-3 rounded-lg shadow-md mb-3 sticky top-0 z-50">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl text-black font-semibold">পরীক্ষা প্রশ্নসমূহ</h2>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                উত্তর দেওয়া: {answeredQuestions}/{exam.questions.length}
              </span>
            </div>
            {exam.duration_minutes > 0 && (
              <Timer
                duration={exam.duration_minutes * 60}
                onTimeUp={handleSubmitExam}
                ref={timerRef}
              />
            )}
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

          <div>
            {/* Question Navigation */}
            <div className="mt-4 flex items-center gap-3">
              <p className="text-sm font-medium text-gray-700 mb-2">
                প্রশ্ন নেভিগেশন:
              </p>
              <div className="flex flex-wrap gap-2">
                {exam.questions.map((question, index) => {
                  const isAnswered = userAnswers.has(question.id);
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

              <div className="flex-1"></div>
           
              <p className="text-sm text-gray-600 text-center">
                {Math.round((answeredQuestions / exam.questions.length) * 100)}%
                সম্পন্ন
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {exam.questions.map((question, index) => {
            const selectedAnswer = userAnswers.get(question.id);
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
                    {/* ============================================================================
                UPDATED: Use MathContentRenderer for question content
                Only show question TEXT here if it exists and is NOT an image URL
                Images are handled by QuestionCard component
                ============================================================================ */}
                    <div className="mb-4">
                      {question.content && !isImageUrl(question.content) && (
                        <MathContentRenderer 
                          content={question.content}
                          className="text-lg font-medium text-gray-900 mb-4"
                        />
                      )}
                    </div>
                    {/* ============================================================================
                QuestionCard handles ALL image rendering (question images + option images)
                ============================================================================ */}

                    <QuestionCard
                      question={question}
                      selectedOption={selectedAnswer?.selected_option}
                      submittedAnswerText={
                        selectedAnswer?.submitted_answer_text
                      }
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
    </>
  );
}