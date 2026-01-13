// src/components/home/CourseCard.tsx
'use client';

import Link from 'next/link';
import { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      
      {/* Course Image/Header */}
      <div className="relative h-44 bg-gradient-to-br from-purple-600 to-blue-600">
        {/* Early Bird Badge */}
        {course.isEarlyBird && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
            Early Bird
          </div>
        )}
        
        {/* Course Title in Image */}
        <div className="absolute inset-0 flex items-center justify-center text-white p-4">
          <div className="text-center">
            <div className="text-sm mb-1">৫১ বিসিএস</div>
            <h3 className="font-bold text-base leading-tight">
              {course.titleBangla}
            </h3>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        {/* Course Title */}
        <h4 className="font-semibold text-gray-800 mb-3 h-12 line-clamp-2">
          {course.title}
        </h4>

        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">
            {course.price === 0 ? (
              <span className="text-green-600">ফ্রি</span>
            ) : (
              <>৳{course.price.toLocaleString()}</>
            )}
          </div>
          
          <Link
            href={`/courses/${course.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            বিস্তারিত
          </Link>
        </div>
      </div>
    </div>
  );
}