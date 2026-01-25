// src/app/courses/[courseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import apiService from '@/lib/api';
import { Course, Exam, SyllabusItem } from '@/lib/types';

type ApiCourse = Partial<Course> & {
  id?: number | string;
  titleBangla?: string;
  is_free?: boolean | null;
  duration?: string | number;
  lectures?: number;
  students?: number;
  isEarlyBird?: boolean;
  isEnrolled?: boolean;
  discount_start_date?: string;
  discount_end_date?: string;
  discount_price?: number;
  early_bird_price?: number;
};



const getPriceValue = (course: Course): number => {
  const price = Number(course.price ?? 0);
  
  const earlyBirdPrice = Number(course.early_bird_price ?? 0);
  const earlyBirdEndDate = new Date(course.early_bird_end_date ?? '');
  
  const discountStartDate = new Date(course.discount_start_date ?? '');
  const discountEndDate = new Date(course.discount_end_date ?? '');
  const discount = Number(course.discount_price ?? 0);
  
  const now = new Date();


  // if early bird is valid, return that price
  if (earlyBirdPrice > 0 && earlyBirdEndDate > now) {
    return earlyBirdPrice;
  }

  // if discount is valid, return that price
  if (discount > 0 && discountStartDate <= now && discountEndDate >= now) {
    return discount;
  }
  
  return price;
}

const normalizeCourse = (payload: ApiCourse): Course => {
  console.log("Normalizing course payload:", payload);
  const id = payload.id !== undefined ? String(payload.id) : '';
  const title = payload.title ?? payload.titleBangla ?? 'Course';
  return {
    id,
    title,
    titleBangla: payload.titleBangla ?? title,
    category: 'all',
    price: getPriceValue(payload as Course),
    thumbnail: payload.thumbnail ?? '',
    duration: payload.duration ?? 'N/A',
    lectures: payload.lectures ?? 0,
    students: payload.students ?? 0,
    instructor: payload.instructor ?? '',
    features: Array.isArray(payload.features) ? payload.features : [],
    description: payload.description ?? '',
    syllabus: Array.isArray(payload.syllabus) ? (payload.syllabus as SyllabusItem[]) : [],
    isFeatured: payload.isFeatured,
    isEarlyBird: payload.isEarlyBird ?? false,
    isEnrolled: payload.isEnrolled ?? false,
    is_free: payload.is_free ?? false,
  };
};

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSyllabus, setExpandedSyllabus] = useState<string[]>([]);

  const fallbackSyllabus: SyllabusItem[] = [
    { id: 'tg-link', title: '51 BCS Telegram Support Group Joining Link', topics: [] },
    { id: 'classroom-link', title: '51 BCS Written Classroom Joining Link', topics: [] },
    { id: 'routine', title: '৫১ বিসিএস কোর্স রুটিন', topics: [] },
    { id: 'live-class', title: 'লাইভ ক্লাস জয়েনিং লিংক', topics: [] },
    { id: 'new-student', title: 'নতুন ভর্তি স্টুডেন্টদের জন্য করণীয়', topics: [] },
    { id: 'guideline', title: '৫১ বিসিএস গাইডলাইন সেশন', topics: [] },
    { id: 'past-questions', title: 'বিসিএস এর বিগত বছরের প্রশ্নসমূহ', topics: [] },
    { id: 'written-class', title: 'রিটেন ক্লাস', topics: [] },
    { id: 'bangla-grammar', title: 'বাংলা গ্রামার', topics: [] },
    { id: 'bangla-lit', title: 'বাংলা সাহিত্য', topics: [] },
    { id: 'eng-grammar', title: 'ইংরেজি গ্রামার', topics: [] },
    { id: 'eng-lit', title: 'ইংরেজি সাহিত্য', topics: [] },
    { id: 'eng-vocab', title: 'ইংরেজি ভোকাবুলারি', topics: [] },
    { id: 'math', title: 'গাণিতিক যুক্তি', topics: [] },
    { id: 'logic', title: 'মানসিক দক্ষতা', topics: [] },
    { id: 'bd', title: 'বাংলাদেশ বিষয়াবলি', topics: [] },
    { id: 'intl', title: 'আন্তর্জাতিক বিষয়াবলি', topics: [] },
    { id: 'science', title: 'সাধারন বিজ্ঞান', topics: [] },
    { id: 'ict', title: 'কম্পিউটার ও আইসিটি', topics: [] },
    { id: 'ethics', title: 'নৈতিকতা, মূল্যবোধ ও সুশাসন', topics: [] },
    { id: 'geo', title: 'ভূগোল', topics: [] },
  ];

  const fallbackPerks: string[] = [
    'Shareable Course Materials',
    'এক্সাম',
    'Gk Recent class',
    '২০০+ প্রিলি লাইভ ক্লাস',
    '১০০+ রিটেন লাইভ ক্লাস',
    'মোট ৩০০+ লাইভ এক্সাম',
    '২৪/৭ টেলিগ্রাম মেন্টর সাপোর্ট',
    '৫১ বিসিএস রিটেন পর্যন্ত একসেস',
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedCourse = await apiService.getCourseById(courseId) as ApiCourse;
        setCourse(normalizeCourse(fetchedCourse));
        // Assuming fetchedCourse also contains an 'exams' array
        if (fetchedCourse && fetchedCourse.id) {
          const fetchedExams = await apiService.getAllExams(parseInt(courseId));
          setExams(fetchedExams);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch course details or exams:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center mt-3">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/courses"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            কোর্স পাওয়া যায়নি
          </h2>
          <Link
            href="/courses"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            সকল কোর্স দেখুন
          </Link>
        </div>
      </div>
    );
  }

  const features = course.features ?? [];
  const syllabus = course.syllabus ?? [];
  const displayTitle = course.titleBangla ?? course.title ?? 'Course';
  const priceValue = Number(course.price ?? 0);
  const isFree = course.is_free ?? priceValue === 0;
  const duration = course.duration ?? 'N/A';
  const lectures = course.lectures ?? 0;
  const students = course.students ?? 0;
  const isEarlyBird = course.isEarlyBird ?? false;
  const description = course.description ?? '';

  const toggleSyllabus = (id: string) => {
    setExpandedSyllabus(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">হোম</Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-blue-600">কোর্সসমূহ</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{displayTitle}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Course + Syllabus + Exams */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">Course</p>
                  <h1 className="text-3xl font-bold text-gray-900">{displayTitle}</h1>
                  <p className="text-gray-700">{description || 'সমগ্র কোর্স তথ্য দেখতে নিচে যান।'}</p>
                  <div className="flex flex-wrap gap-3 pt-3">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">প্রশ্ন: {exams.length > 0 ? exams.length * 50 : '—'}</span>
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm">ক্লাস: {lectures}</span>
                    <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm">লাইভ সেশন</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-3xl font-bold text-blue-700">{isFree ? 'ফ্রি' : `৳${priceValue.toLocaleString()}`}</div>
                  {!isFree && <p className="text-sm text-gray-500">একবারেই পরিশোধ</p>}
                  {isEarlyBird && <span className="inline-block bg-yellow-300 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">Early Bird</span>}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 
                <Link
                  href={`/courses/${courseId}/live-classes`}
                  className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  লাইভ ক্লাস
                </Link>
                <Link
                  href={`/courses/${courseId}/exams`}
                  className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  এক্সাম
                </Link>
                <Link
                  href={`/courses/${courseId}/enroll`}
                  className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Enroll Now
                </Link> */}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Course Syllabus</h2>
                <span className="text-sm text-gray-500">{(syllabus.length || fallbackSyllabus.length)} items</span>
              </div>
              <div className="space-y-3">
                {(syllabus.length ? syllabus : fallbackSyllabus).map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSyllabus(item.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{item.title}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedSyllabus.includes(item.id) ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedSyllabus.includes(item.id) && (
                      <div className="px-4 pb-4">
                        <ul className="space-y-2 text-gray-700">
                          {(item.topics ?? []).length === 0 ? (
                            <li className="text-gray-500 text-sm">বিস্তারিত শীঘ্রই আসছে</li>
                          ) : (
                            (item.topics ?? []).map((topic, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                {topic}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Exam section intentionally removed per request */}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500">মূল্য</p>
                <div className="text-3xl font-bold text-blue-700">{isFree ? 'ফ্রি' : `৳${priceValue.toLocaleString()}`}</div>
                {!isFree && <p className="text-sm text-gray-500">একবারেই পরিশোধ</p>}
              </div>

              <div className="space-y-3">
                <Link
                  href={`/courses/${courseId}/enroll`}
                  className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition block"
                >
                  Enroll Now
                </Link>
                <Link
                  href={`/courses/${courseId}/live-classes`}
                  className="w-full text-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-3 rounded-lg font-semibold transition block"
                >
                  লাইভ ক্লাস
                </Link>
                <Link
                  href={`/courses/${courseId}/exams`}
                  className="w-full text-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-3 rounded-lg font-semibold transition block"
                >
                  এক্সাম
                </Link>
              </div>

              <div className="mt-6 space-y-2 text-sm text-gray-600 border-t pt-4">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" /> আজীবন এক্সেস
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" /> সার্টিফিকেট প্রদান
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" /> ২৪/৭ সাপোর্ট সুবিধা
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Shareable Course Materials</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                {fallbackPerks.map((perk, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
