// src/components/home/CoursesSection.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import CourseFilters from '@/components/home/CourseFilters';
// import CourseCard from './CourseCard';
import { MOCK_COURSES } from '@/lib/courseData';
import { CourseCategory } from '@/lib/types';
import CourseCard from './CourseCard';

export default function CoursesSection() {
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('all');

  // Filter courses based on selected category
  const filteredCourses = selectedCategory === 'all' 
    ? MOCK_COURSES 
    : MOCK_COURSES.filter(course => course.category === selectedCategory);

  // Show only first 8 courses on home page
  const displayedCourses = filteredCourses.slice(0, 8);
  const hasMoreCourses = filteredCourses.length > 8;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* Filter Buttons */}
        <CourseFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Courses Grid - Show 8 courses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Show "View All" button if more than 8 courses */}
        {hasMoreCourses && (
          <div className="text-center">
            <Link
              href={`/courses?category=${selectedCategory}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              সকল কোর্স দেখুন ({filteredCourses.length}টি কোর্স)
            </Link>
          </div>
        )}

        {/* No courses message */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              এই ক্যাটাগরিতে কোনো কোর্স পাওয়া যায়নি।
            </p>
          </div>
        )}
      </div>
    </section>
  );
}