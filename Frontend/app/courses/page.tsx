// src/app/courses/page.tsx
"use client";

import Pagination from "@/components/courses/Pagination";
import CourseCard from "@/components/home/CourseCard";
import CourseFilters from "@/components/home/CourseFilters";
import { COURSES_PER_PAGE } from "@/constants/courses";
import { getCoursesByCategory, getPaginatedCourses } from "@/lib/courseData";
import { CourseCategory, PaginationInfo } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const categoryParam =
    (searchParams.get("category") as CourseCategory) || "all";

  const [selectedCategory, setSelectedCategory] =
    useState<CourseCategory>(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Update category from URL params
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const filteredCourses = useMemo(() => {
    return getCoursesByCategory(selectedCategory);
  }, [selectedCategory]);

 const paginatedCourses = useMemo(() => {
  return getPaginatedCourses(currentPage, COURSES_PER_PAGE, selectedCategory);
}, [selectedCategory, currentPage]);

 const paginationInfo: PaginationInfo = {
  currentPage,
  totalPages: paginatedCourses.totalPages,
  totalCourses: paginatedCourses.total,
  coursesPerPage: COURSES_PER_PAGE,
};

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            আমাদের কোর্সসমূহ
          </h1>
          <p className="text-gray-600 text-lg">
  মোট {paginatedCourses.total}টি কোর্স পাওয়া গেছে
</p>
        </div>

        {/* Course Filters */}
        <CourseFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Courses Grid */}
       {paginatedCourses.courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {paginatedCourses.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
}
