// // src/app/courses/[courseId]/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import apiService from '@/lib/api';
// import { Course, Exam } from '@/lib/types';
// import ExamCard from '@/components/exam/ExamCard';

// export default function CourseDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const courseId = params.courseId as string;

//   const [course, setCourse] = useState<Course | null>(null);
//   const [exams, setExams] = useState<Exam[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedSyllabus, setExpandedSyllabus] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const fetchedCourse = await apiService.getCourseById(courseId);
//         setCourse(fetchedCourse);
//         // Assuming fetchedCourse also contains an 'exams' array
//         if (fetchedCourse && fetchedCourse.id) {
//           const fetchedExams = await apiService.getAllExams(parseInt(courseId));
//           setExams(fetchedExams);
//         }
//       } catch (err: any) {
//         setError(err.message);
//         console.error("Failed to fetch course details or exams:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (courseId) {
//       fetchData();
//     }
//   }, [courseId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <p className="text-gray-600">Loading course details...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <Link
//             href="/courses"
//             className="text-blue-600 hover:text-blue-700 font-medium"
//           >
//             Back to courses
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (!course) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">
//             কোর্স পাওয়া যায়নি
//           </h2>
//           <Link
//             href="/courses"
//             className="text-blue-600 hover:text-blue-700 font-medium"
//           >
//             সকল কোর্স দেখুন
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const toggleSyllabus = (id: string) => {
//     setExpandedSyllabus(prev =>
//       prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Breadcrumb */}
//       <div className="bg-white border-b">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center space-x-2 text-sm text-gray-600">
//             <Link href="/" className="hover:text-blue-600">হোম</Link>
//             <span>/</span>
//             <Link href="/courses" className="hover:text-blue-600">কোর্সসমূহ</Link>
//             <span>/</span>
//             <span className="text-gray-900 font-medium">{course.titleBangla}</span>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             {/* Course Header */}
//             <div className="bg-white rounded-lg shadow-md p-8 mb-6">
//               <div className="flex items-start justify-between mb-4">
//                 <h1 className="text-3xl font-bold text-gray-900">
//                   {course.titleBangla}
//                 </h1>
//                 {course.isEarlyBird && (
//                   <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
//                     Early Bird
//                   </span>
//                 )}
//               </div>
              
//               <p className="text-gray-600 mb-6">{course.description}</p>

//               {/* Course Stats */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b">
//                 <div>
//                   <div className="text-gray-500 text-sm">সময়কাল</div>
//                   <div className="text-lg font-semibold text-gray-900">{course.duration}</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500 text-sm">ক্লাস</div>
//                   <div className="text-lg font-semibold text-gray-900">{course.lectures}টি</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500 text-sm">শিক্ষার্থী</div>
//                   <div className="text-lg font-semibold text-gray-900">{course.students}+</div>
//                 </div>
//                 <div>
//                   <div className="text-gray-500 text-sm">মূল্য</div>
//                   <div className="text-lg font-semibold text-blue-600">
//                     {course.price === 0 ? 'ফ্রি' : `৳${course.price.toLocaleString()}`}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Course Features */}
//             <div className="bg-white rounded-lg shadow-md p-8 mb-6">
//               <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                 কোর্সের বৈশিষ্ট্য
//               </h2>
//               <div className="space-y-3">
//                 {course.features.map((feature, index) => (
//                   <div key={index} className="flex items-start">
//                     <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span className="text-gray-700">{feature}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Course Syllabus */}
//             {course.syllabus.length > 0 && (
//               <div className="bg-white rounded-lg shadow-md p-8 mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                   কোর্স সিলেবাস
//                 </h2>
//                 <div className="space-y-3">
//                   {course.syllabus.map((item) => (
//                     <div key={item.id} className="border border-gray-200 rounded-lg">
//                       <button
//                         onClick={() => toggleSyllabus(item.id)}
//                         className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
//                       >
//                         <span className="font-medium text-gray-900">{item.title}</span>
//                         <svg
//                           className={`w-5 h-5 text-gray-500 transition-transform ${expandedSyllabus.includes(item.id) ? 'rotate-180' : ''
//                             }`}
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </button>
//                       {expandedSyllabus.includes(item.id) && (
//                         <div className="px-4 pb-4">
//                           <ul className="space-y-2 text-gray-700">
//                             {item.topics.map((topic, idx) => (
//                               <li key={idx} className="flex items-start">
//                                 <span className="text-blue-600 mr-2">•</span>
//                                 {topic}
//                               </li>
//                             ))}
//                           </ul>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Exams Section */}
//             {exams.length > 0 && (
//               <div className="bg-white rounded-lg shadow-md p-8">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">
//                   এই কোর্সের পরীক্ষা
//                 </h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {exams.map((exam) => (
//                     <ExamCard key={exam.id} exam={exam} isEnrolled={course.isEnrolled} />
//                   ))}
//                 </div>
//               </div>
//             )}

//           </div>

//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
//               <div className="mb-6">
//                 <div className="text-3xl font-bold text-blue-600 mb-2">
//                   {course.price === 0 ? (
//                     <span className="text-green-600">ফ্রি</span>
//                   ) : (
//                     <>৳{course.price.toLocaleString()}</>
//                   )}
//                 </div>
//                 {course.price > 0 && (
//                   <div className="text-sm text-gray-500">
//                     একবারের পেমেন্টে সম্পূর্ণ কোর্স
//                   </div>
//                 )}
//               </div>

//               <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-lg mb-4 transition-colors">
//                 এখনই ভর্তি হন
//               </button>

//               <div className="space-y-3 text-sm text-gray-600 border-t pt-4">
//                 <div className="flex items-center">
//                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   আজীবন এক্সেস
//                 </div>
//                 <div className="flex items-center">
//                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   সার্টিফিকেট প্রদান
//                 </div>
//                 <div className="flex items-center">
//                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//                   </svg>
//                   সাপোর্ট সুবিধা
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
