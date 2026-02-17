// src/components/home/CoursesSection.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import CourseFilters, { CourseCategory } from '@/components/home/CourseFilters';
import CourseCard from './CourseCard';
import apiService from '@/lib/api';

type HomeCourse = {
  id: number | string;
  title: string;
  titleBangla?: string;
  price?: number | string;
  is_free?: boolean;
  thumbnail?: string;
  description?: string;
  discount?: number | string;
};

export default function CoursesSection() {
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory>('all');
  const [courses, setCourses] = useState<HomeCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getAllCourses();
        const list = Array.isArray(data) ? data : data?.data || [];
        const normalized = list.map((course: any) => ({
          id: course.id,
          title: course.title || 'Untitled course',
          titleBangla: course.titleBangla || course.title,
          price: course.price ?? 0,
          is_free: course.is_free ?? false,
          thumbnail: course.thumbnail,
          description: course.description,
          discount: course.discount,
        }));
        setCourses(normalized);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err?.message || 'কোর্স লোড করতে সমস্যা হচ্ছে');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const filterByCategory = (course: HomeCourse) => {
      const title = (course.title || '').toLowerCase();
      const priceValue = typeof course.price === 'number' ? course.price : Number(course.price ?? 0);

      if (selectedCategory === 'free') {
        return Boolean(course.is_free) || priceValue === 0;
      }
      if (selectedCategory === 'bcs') {
        return title.includes('bcs');
      }
      if (selectedCategory === 'bank') {
        return title.includes('bank');
      }
      if (selectedCategory === 'primary') {
        return title.includes('primary');
      }
      return true;
    };

    return courses.filter(filterByCategory);
  }, [courses, selectedCategory]);

  const displayedCourses = filteredCourses.slice(0, 8);
  const hasMoreCourses = filteredCourses.length > 8;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">কোর্সগুলো</p>
            <h2 className="text-2xl font-bold text-gray-900">সর্বশেষ কোর্সসমূহ</h2>
          </div>
          {hasMoreCourses && (
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              সকল কোর্স দেখুন
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>

        <CourseFilters
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-gray-600">কোর্স লোড হচ্ছে...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 font-semibold">
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              এই ক্যাটাগরিতে কোনো কোর্স পাওয়া যায়নি।
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {displayedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

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
          </>
        )}
      </div>
    </section>
  );
}