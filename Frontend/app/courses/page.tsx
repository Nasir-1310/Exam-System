// src/app/courses/page.tsx
"use client";

import Pagination from "@/components/courses/Pagination";
import CourseCard from "@/components/home/CourseCard";
import CourseFilters from "@/components/home/CourseFilters";
import { COURSES_PER_PAGE } from "@/constants/courses";
import { getPaginatedCourses } from "@/lib/courseData";
import { CourseCategory, PaginationInfo } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const categoryParam =
    (searchParams.get("category") as CourseCategory) || "all";

  const [selectedCategory, setSelectedCategory] =
    useState<CourseCategory>(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedCourses, setPaginatedCourses] = useState<{
    courses: Course[];
    total: number;
    totalPages: number;
    page: number;
  } | null>(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Update category from URL params
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaginatedCourses(
        currentPage,
        COURSES_PER_PAGE,
        selectedCategory
      );
      setPaginatedCourses(data);
    } catch (err: any) {
      console.error("Error fetching paginated courses:", err);
      setError("Failed to load courses.");
      setPaginatedCourses({ courses: [], total: 0, totalPages: 1, page: 1 }); // Set empty data on error
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages: paginatedCourses?.totalPages || 1, // Use optional chaining and default
    totalCourses: paginatedCourses?.total || 0, // Use optional chaining and default
    coursesPerPage: COURSES_PER_PAGE,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">কোর্স লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!paginatedCourses || paginatedCourses.courses.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-24 h-24 mx-auto"
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
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          কোনো কোর্স পাওয়া যায়নি
        </h3>
        <p className="text-gray-500">
          এই ক্যাটাগরিতে বর্তমানে কোনো কোর্স উপলব্ধ নেই।
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            আমাদের কোর্সসমূহ
          </h1>
          <p className="text-xl text-white/90 mb-2">
            বিসিএস প্রস্তুতির জন্য সেরা কোর্সসমূহ
          </p>
          <p className="text-white/80">
            মোট {paginatedCourses.total}টি কোর্স পাওয়া গেছে
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Course Filters */}
        <div className="mb-12">
          <CourseFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {paginatedCourses.courses.map((course) => (
            <Link href={`/courses/${course.id}`} key={course.id} className="block">
              <CourseCard course={course} />
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {paginatedCourses.courses.length > 0 && (
          <div className="flex justify-center">
            <Pagination
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">বিশেষজ্ঞ শিক্ষক</h3>
              <p className="text-gray-600">অভিজ্ঞ এবং যোগ্য শিক্ষকদের দ্বারা পরিচালিত</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">আধুনিক প্রযুক্তি</h3>
              <p className="text-gray-600">আধুনিক শিক্ষা প্রযুক্তি এবং পদ্ধতি ব্যবহার</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-2xl mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">গ্যারান্টি</h3>
              <p className="text-gray-600">সফলতার গ্যারান্টি এবং মানসম্পন্ন শিক্ষা</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
