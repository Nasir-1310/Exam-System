import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { Course } from '@/lib/types';
import CourseCard from '@/components/home/CourseCard';
import { getCookie } from '@/lib/cookies';

export default function DashboardPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!apiService.isAuthenticated()) {
        router.push('/auth/login');
        return;
      }
      try {
        setLoading(true);
        const courses = await apiService.getAllCourses();
        setEnrolledCourses(courses);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch enrolled courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [router]);

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading courses...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">My Dashboard</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Enrolled Courses</h2>
          {enrolledCourses.length === 0 ? (
            <p className="text-gray-600 text-center">You are not enrolled in any courses yet. Explore available courses!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}