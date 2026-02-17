"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import Swal from "sweetalert2";

interface Exam {
  id: number;
  title: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  mark: number;
  minus_mark: number;
  course_id: number | null;
  questions: any[];
  is_mcq: boolean;
}

interface Course {
  id: number;
  title: string;
}

export default function ExamPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "mcq" | "written">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [examData, courseData] = await Promise.all([
        apiService.getAllExams(),
        apiService.getAllCourses().catch(() => []),
      ]);
      setExams(examData);
      setCourses(courseData || []);
    } catch (err: any) {
      setError(err.message || "Failed to load exams");
      console.error("Error fetching exams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = (exam: Exam) => {
    console.log("Navigating to exam:", exam);
    const startTime = new Date(exam.start_time);
    const now = new Date();

    if (now < startTime) {
      Swal.fire({
        icon: "info",
        title: "পরীক্ষা শুরু হয়নি",
        text: `এই পরীক্ষা শুরু হবে: ${startTime.toLocaleString()}`,
        confirmButtonText: "ঠিক আছে",
      });
      return;
    }

    if (exam.is_mcq) {
      router.push(`/exam/mcq/${exam.id}`);
    } else {
      router.push(`/exam/written/${exam.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredExams = exams.filter((exam) => {
    if (filter === "all") return true;
    if (filter === "mcq") return exam.is_mcq;
    if (filter === "written") return !exam.is_mcq;
    return true;
  });

  const courseTitle = (courseId: number | null) => {
    if (!courseId) return "স্বতন্ত্র পরীক্ষা";
    const course = courses.find((c) => c.id === courseId);
    return course ? course.title : "কোর্স তথ্য নেই";
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium mb-2">Error Loading Exams</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <div className="mb-8 mt-4 md:mt-8">
          <div className="w-full rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/courses.png"
              alt="Courses banner"
              className="w-full h-56 md:h-72 object-cover h-full"
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            সকল উপলব্ধ পরীক্ষা
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            পরীক্ষার ধরন নির্বাচন করে আপনার পরীক্ষা শুরু করুন
          </p>
          <p className="text-gray-500">
            মোট {exams.length}টি পরীক্ষা উপলব্ধ
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-8 py-4 font-semibold rounded-xl transition-all duration-300 ${
                  filter === "all"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                সকল পরীক্ষা ({exams.length})
              </button>
              <button
                onClick={() => setFilter("mcq")}
                className={`px-8 py-4 font-semibold rounded-xl transition-all duration-300 ${
                  filter === "mcq"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                MCQ পরীক্ষা ({exams.length})
              </button>
              <button
                onClick={() => setFilter("written")}
                className={`px-8 py-4 font-semibold rounded-xl transition-all duration-300 ${
                  filter === "written"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                লিখিত পরীক্ষা (0)
              </button>
            </div>
          </div>
        </div>

        {/* Exam Cards Grid */}
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              কোনো পরীক্ষা উপলব্ধ নেই
            </h3>
            <p className="text-gray-600 text-lg">
              এই ক্যাটাগরিতে বর্তমানে কোনো পরীক্ষা উপলব্ধ নেই। পরে আবার চেক করুন!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => handleExamClick(exam)}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group hover:-translate-y-1"
              >
                {/* Header with gradient */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30">
                      MCQ পরীক্ষা
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center gap-1 text-white/90 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{exam.duration_minutes} মিনিট</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Exam Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {exam.title}
                  </h3>

                  <p className="text-sm text-gray-500 mb-2">
                    কোর্স: {courseTitle(exam.course_id)}
                  </p>

                  {/* Description */}
                  {exam.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {exam.description}
                    </p>
                  )}

                  {/* Exam Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 mb-1">
                        {exam.questions?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">প্রশ্ন</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {exam.mark}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">নম্বর</div>
                    </div>
                  </div>

                  {/* Start Time */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <span>শুরু হবে:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(exam.start_time)}
                    </span>
                  </div>

                  {/* Start Button */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      ক্লিক করে শুরু করুন
                    </span>
                    <div className="flex items-center gap-2 text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      <span className="text-sm font-medium">শুরু করুন</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              শুরু করার আগে জেনে নিন:
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">স্থিতিশীল ইন্টারনেট</h4>
              <p className="text-gray-600 text-sm">পরীক্ষা চলাকালীন স্থিতিশীল ইন্টারনেট সংযোগ নিশ্চিত করুন</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">স্বয়ংক্রিয় মূল্যায়ন</h4>
              <p className="text-gray-600 text-sm">MCQ পরীক্ষা স্বয়ংক্রিয়ভাবে মূল্যায়ন করা হয়</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">সময়সীমা</h4>
              <p className="text-gray-600 text-sm">সময় শেষ হলে পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-semibold text-indigo-900 mb-1">গুরুত্বপূর্ণ নোট:</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• একবার শুরু করলে পরীক্ষা থামানো যাবে না</li>
                  <li>• টাইমার শুরু হওয়ার সাথে সাথে সময় গণনা শুরু হয়</li>
                  <li>• সকল প্রশ্নের উত্তর দেওয়া বাধ্যতামূলক নয়</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}