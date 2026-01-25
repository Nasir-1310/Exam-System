// src/components/home/CourseCard.tsx
'use client';

import { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group">
      {/* Course Image/Header */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
        {/* Early Bird Badge */}
        {course.isEarlyBird && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            ⚡ Early Bird
          </div>
        )}

        {/* Course Title in Image */}
        <div className="absolute inset-0 flex items-center justify-center text-white p-6">
          <div className="text-center">
            <div className="text-sm mb-2 opacity-90">৫১ বিসিএস</div>
            <h3 className="font-bold text-lg leading-tight">
              {course.titleBangla}
            </h3>
          </div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Course Title */}
        <h4 className="font-bold text-gray-900 mb-3 h-14 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h4>

        {/* Course Features */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{course.duration || '৬ মাস'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>{course.lectures || 120} lectures</span>
          </div>
        </div>

        {/* Price and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-2xl font-bold text-indigo-600">
            {course.price === 0 ? (
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-semibold">ফ্রি</span>
            ) : (
              <span>৳{course.price.toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-indigo-600 group-hover:text-indigo-700 transition-colors">
            <span className="text-sm font-medium">বিস্তারিত</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}