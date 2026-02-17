// Frontend/app/(admin)/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import type { User } from '@/types/user';
import type { Course } from '@/types/course';
import CustomModal from '@/components/common/CustomModal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [enrolling, setEnrolling] = useState(false);
  
  // Success/Error modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, coursesData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllCourses(),
      ]);
      setUsers(usersData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      showError('ডেটা লোড করতে ব্যর্থ হয়েছে', 'সার্ভার থেকে তথ্য আনতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirm = window.confirm('ব্যবহারকারী মুছে ফেলবেন?');
    if (!confirm) return;
    try {
      await apiService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showSuccess('মুছে ফেলা হয়েছে', 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (error: unknown) {
      const err = error as { message?: string };
      showError('মুছতে ব্যর্থ', err.message || 'ব্যবহারকারী মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const handleEnrollUser = async () => {
    if (!selectedUser || !selectedCourseId) return;

    try {
      setEnrolling(true);
      await apiService.enrollUserInCourse({
        user_id: selectedUser.id,
        course_id: parseInt(selectedCourseId),
      });
      
      setShowEnrollModal(false);
      setSelectedUser(null);
      setSelectedCourseId('');
      
      showSuccess(
        'কোর্সে নথিভুক্ত সফল!',
        `${selectedUser.name} সফলভাবে কোর্সে নথিভুক্ত হয়েছে।`,
        'ব্যবহারকারী এখন এই কোর্সের সকল কন্টেন্ট অ্যাক্সেস করতে পারবে।'
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      showError(
        'নথিভুক্তি ব্যর্থ!',
        err.message || 'কোর্সে নথিভুক্ত করতে সমস্যা হয়েছে।',
        'অনুগ্রহ করে আবার চেষ্টা করুন বা সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।'
      );
    } finally {
      setEnrolling(false);
    }
  };

  const showSuccess = (title: string, message: string, description?: string) => {
    setModalMessage({ title, message, description: description || '' });
    setShowSuccessModal(true);
  };

  const showError = (title: string, message: string, description?: string) => {
    setModalMessage({ title, message, description: description || '' });
    setShowErrorModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ব্যবহারকারী পরিচালনা</h1>
        <p className="text-gray-600">সকল ব্যবহারকারী দেখুন এবং পরিচালনা করুন</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">মোট ব্যবহারকারী</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">অ্যাডমিন</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">সাধারণ ব্যবহারকারী</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.role === 'USER').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">সকল ব্যবহারকারী</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  নাম
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ইমেইল
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ভূমিকা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  মোবাইল
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কাজ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    কোনো ব্যবহারকারী পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'MODERATOR' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.active_mobile || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEnrollModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
                          >
                            কোর্সে নথিভুক্ত করুন
                          </button>
                        )}
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors"
                          >
                            মুছে ফেলুন
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Modal - Using Professional Design */}
      {showEnrollModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">কোর্সে নথিভুক্ত করুন</h3>
              </div>
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedUser(null);
                  setSelectedCourseId('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">ব্যবহারকারী:</p>
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  কোর্স নির্বাচন করুন <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">কোর্স নির্বাচন করুন</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEnrollModal(false);
                  setSelectedUser(null);
                  setSelectedCourseId('');
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleEnrollUser}
                disabled={enrolling || !selectedCourseId}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
              >
                {enrolling ? 'নথিভুক্ত করা হচ্ছে...' : 'নথিভুক্ত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <CustomModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalMessage.title}
        message={modalMessage.message}
        description={modalMessage.description}
        type="success"
        buttons={[
          {
            label: 'ঠিক আছে',
            onClick: () => setShowSuccessModal(false),
            variant: 'primary',
          },
        ]}
      />

      {/* Error Modal */}
      <CustomModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalMessage.title}
        message={modalMessage.message}
        description={modalMessage.description}
        type="error"
        buttons={[
          {
            label: 'ঠিক আছে',
            onClick: () => setShowErrorModal(false),
            variant: 'primary',
          },
        ]}
      />
    </div>
  );
}