// Frontend/app/admin/dashboard/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import CreateExamModal from '@/components/admin/CreateExamModal';
import AddQuestionModal from '@/components/admin/AddQuestionModal';
import BulkQuestionUploadModal from '@/components/admin/BulkQuestionUploadModal';
import ExamDetailModal from '@/components/admin/ExamDetailModal';

interface Exam {
  id: number;
  title: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  mark: number;
  minus_mark: number;
  questions?: Question[];
}

interface Question {
  id: number;
  q_type: string;
  content: string;
  options: string[];
  answer_idx: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showExamDetailModal, setShowExamDetailModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  useEffect(() => {
    const currentUser = apiService.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MODERATOR')) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllExams();
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    router.push('/auth/login');
  };

  const handleDeleteExam = async (examId: number) => {
    if (!confirm('আপনি কি নিশ্চিত এই পরীক্ষা মুছে ফেলতে চান?')) {
      return;
    }

    try {
      await apiService.deleteExam(examId);
      alert('পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে');
      loadExams(); // Re-fetch exams after successful deletion
    } catch (error: any) {
      alert(error.message || 'পরীক্ষা মুছে ফেলতে ব্যর্থ');
    }
  };

  const handleViewExam = async (examId: number) => {
    try {
      const examDetail = await apiService.getExamById(examId);
      setSelectedExam(examDetail);
      setShowExamDetailModal(true);
    } catch (error) {
      alert('পরীক্ষার বিস্তারিত লোড করতে ব্যর্থ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <header className="bg-white shadow sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
                <p className="text-sm text-gray-600">স্বাগতম, {user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                লগআউট
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">মোট পরীক্ষা</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{exams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">মোট প্রশ্ন</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {exams.reduce((sum, exam) => sum + (exam.questions?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">আপনার ভূমিকা</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Exam Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            নতুন পরীক্ষা তৈরি করুন
          </button>
        </div>

        {/* Exams List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">সকল পরীক্ষা</h2>
          </div>

          {exams.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">কোনো পরীক্ষা নেই</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                প্রথম পরীক্ষা তৈরি করুন
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {exams.map((exam) => (
                <div key={exam.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words">{exam.title}</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{exam.description}</p>
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(exam.start_time).toLocaleDateString('bn-BD')}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {exam.duration_minutes} মিনিট
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {exam.questions?.length || 0} প্রশ্ন
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          </svg>
                          নম্বর: {exam.mark}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row lg:flex-col gap-2 lg:ml-4">
                      <button
                        onClick={() => handleViewExam(exam.id)}
                        className="flex-1 lg:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                      >
                        বিস্তারিত দেখুন
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowAddQuestionModal(true);
                          }}
                          className="flex-1 lg:flex-none px-2 sm:px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                        >
                          প্রশ্ন যোগ করুন
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowBulkUploadModal(true);
                          }}
                          className="flex-1 lg:flex-none px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                        >
                          বাল্ক আপলোড
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="flex-1 lg:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                      >
                        মুছে ফেলুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadExams();
          }}
        />
      )}

      {showAddQuestionModal && selectedExam && (
        <AddQuestionModal
          exam={selectedExam}
          onClose={() => {
            setShowAddQuestionModal(false);
            setSelectedExam(null);
          }}
          onSuccess={() => {
            setShowAddQuestionModal(false);
            setSelectedExam(null);
            loadExams();
          }}
        />
      )}

      {showBulkUploadModal && selectedExam && (
        <BulkQuestionUploadModal
          exam={selectedExam}
          onClose={() => {
            setShowBulkUploadModal(false);
            setSelectedExam(null);
          }}
          onSuccess={() => {
            setShowBulkUploadModal(false);
            setSelectedExam(null);
            loadExams();
          }}
        />
      )}

      {showExamDetailModal && selectedExam && (
        <ExamDetailModal
          exam={selectedExam}
          onClose={() => {
            setShowExamDetailModal(false);
            setSelectedExam(null);
          }}
          onUpdate={loadExams}
        />
      )}
    </div>
  );
}