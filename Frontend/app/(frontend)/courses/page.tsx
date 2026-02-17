"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  discount: number;
  is_free: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Auth Popup Component
function AuthPopup({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: string }) {
  const router = useRouter();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {type === "exam" ? "Access Exam" : "Join Live Class"}
        </h2>
        <p className="text-gray-600 mb-6">
          Please login or register to {type === "exam" ? "take this exam" : "join the live class"}.
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/login")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/register")}
            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
          >
            Register
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 px-6 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, onExamClick, onLiveClassClick }: any) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col cursor-pointer"
      onClick={(e)=>{
        e.stopPropagation();
        router.push(`/courses/${course.id}`);
      }}>
      {/* Course Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        <img
          src={course.thumbnail || "/placeholder-course.jpg"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {course.is_free && (
          <span className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            FREE
          </span>
        )}
        {!course.is_free && course.discount > 0 && (
          <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {course.discount}% OFF
          </span>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description || "No description available"}
        </p>

        {/* gap */}
        <div className="flex-1"></div>
        
        <div className="mb-4">
          {course.is_free ? (
            <span className="text-2xl font-bold text-green-600">Free</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                ৳{course.price}
              </span>
              {course.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ৳{(course.price / (1 - course.discount / 100)).toFixed(0)}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onExamClick(course)
            }}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Exams
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLiveClassClick(course)
            }}
            className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Live Classes
          </button> */}
           <Link
            href={`/courses/${course.id}`}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [authPopup, setAuthPopup] = useState({ isOpen: false, type: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const coursesPerPage = 8;

  useEffect(() => {
    fetchCourses();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/courses/`);
      const data = await response.json();
      console.log('fetched courses data:', data);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Courses", icon: "📚" },
    { id: "bcs", label: "BCS Courses", icon: "🎓" },
    { id: "bank", label: "Bank Courses", icon: "🏦" },
    { id: "primary", label: "Primary Courses", icon: "📖" },
    { id: "free", label: "Free Courses", icon: "🆓" },
  ];

  const filterCourses = () => {
    if (!Array.isArray(courses)) {
      console.log('courses is not array', courses);
      return [];
    }
    let filtered = courses;
    
    if (activeTab === "free") {
      filtered = courses.filter(c => c.is_free);
    } else if (activeTab === "bcs") {
      filtered = courses.filter(c => c.title.toLowerCase().includes("bcs"));
    } else if (activeTab === "bank") {
      filtered = courses.filter(c => c.title.toLowerCase().includes("bank"));
    } else if (activeTab === "primary") {
      filtered = courses.filter(c => c.title.toLowerCase().includes("primary"));
    }
    
    return filtered;
  };

  const filteredCourses = filterCourses();
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const displayedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  const handleExamClick = (course: Course) => {
    if (!isLoggedIn && !course.is_free) {
      setAuthPopup({ isOpen: true, type: "exam" });
    } else {
      router.push(`/courses/${course.id}/exams`);
    }
  };

  const handleLiveClassClick = (course: Course) => {
    if (!isLoggedIn) {
      setAuthPopup({ isOpen: true, type: "live" });
    } else {
      alert(`Live class link: https://zoom.us/j/example-${course.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 pt-22">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Courses</h1>
          <p className="text-gray-600">
            Choose from our wide range of courses to boost your career
          </p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {displayedCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Courses Available
            </h3>
            <p className="text-gray-600">
              No courses found in this category.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onExamClick={handleExamClick}
                  onLiveClassClick={handleLiveClassClick}
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

      <AuthPopup
        isOpen={authPopup.isOpen}
        onClose={() => setAuthPopup({ isOpen: false, type: "" })}
        type={authPopup.type}
      />
    </div>
  );
}