// Frontend/app/(admin)/exams/page.tsx
// Frontend/app/(admin)/dashboard/page.tsx

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/api';
import CreateExamModal from '@/components/admin/CreateExamModal';
import AddQuestionModal from '@/components/admin/AddQuestionModal';
import BulkQuestionUploadModal from '@/components/admin/BulkQuestionUploadModal';
import ExamDetailModal from '@/components/admin/ExamDetailModal';
import CustomModal from '@/components/common/CustomModal';
import { createSuccessModal, createErrorModal, createConfirmModal } from '@/lib/modalHelpers';

interface Question {
  id: number;
  q_type: string;
  content: string;
  options: string[];
  answer: string;
}

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

interface User {
  name: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showExamDetailModal, setShowExamDetailModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ReturnType<typeof createSuccessModal> | ReturnType<typeof createErrorModal> | ReturnType<typeof createConfirmModal> | null>(null);
  const [examToDelete, setExamToDelete] = useState<number | null>(null);

  useEffect(() => {
    const currentUser = apiService.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MODERATOR')) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadExams();
  }, [router]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllExams();
      setExams(data);
    } catch (error) {
      console.error('Failed to load exams:', error);
      const err = error as { message?: string };
      setModalConfig(createErrorModal(
        "লোড ব্যর্থ!",
        "পরীক্ষা লোড করতে সমস্যা হয়েছে।",
        err.message || "অনুগ্রহ করে পেজ রিফ্রেশ করুন।"
      ));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    router.push('/login');
  };

  const handleDeleteExamClick = (examId: number) => {
    console.log("=== Delete Click ===");
    console.log("Exam ID:", examId);
    
    // Check if exam has questions
    const exam = exams.find(e => e.id === examId);
    const questionCount = exam?.questions?.length || 0;
    
    console.log("Question Count:", questionCount);
    
    if (questionCount > 0) {
      setModalConfig(createErrorModal(
        "মুছে ফেলা যাবে না!",
        "এই পরীক্ষায় প্রশ্ন রয়েছে।",
        `প্রথমে ${questionCount}টি প্রশ্ন মুছে ফেলুন, তারপর পরীক্ষা মুছতে পারবেন।`
      ));
      setShowErrorModal(true);
      return;
    }
    
    // Store exam ID before showing modal
    setExamToDelete(examId);
    
    // Create confirm modal with the examId directly in the callback
    const confirmConfig = {
      title: "পরীক্ষা মুছে ফেলবেন?",
      message: "আপনি কি নিশ্চিত যে এই পরীক্ষাটি মুছে ফেলতে চান?",
      description: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
      type: "confirm" as const,
      icon: "?",
      iconColor: "bg-yellow-500",
      subtitle: "আপনি কি নিশ্চিত যে এই পরীক্ষাটি মুছে ফেলতে চান?",
      buttons: [
        {
          label: "না, রাখুন",
          onClick: () => {
            console.log("Cancel clicked");
            setShowConfirmModal(false);
            setExamToDelete(null);
            setModalConfig(null);
          },
          variant: "secondary" as const,
        },
        {
          label: "হ্যাঁ, মুছে ফেলুন",
          onClick: () => {
            console.log("Confirm delete clicked for exam:", examId);
            confirmDeleteExam(examId);
          },
          variant: "danger" as const,
        },
      ],
    };
    
    setModalConfig(confirmConfig);
    setShowConfirmModal(true);
  };

  const confirmDeleteExam = async (examId: number) => {
    console.log("=== Delete Exam Started ===");
    console.log("Exam to Delete:", examId);
    
    if (!examId) {
      console.log("❌ No exam to delete");
      return;
    }

    try {
      console.log("✓ Closing confirm modal...");
      setShowConfirmModal(false);
      setModalConfig(null);
      
      console.log("✓ Calling delete API...");
      const response = await apiService.deleteExam(examId);
      console.log("✅ Delete API Response:", response);
      
      console.log("✓ Preparing success modal...");
      const successConfig = createSuccessModal(
        "পরীক্ষা মুছে ফেলা হয়েছে!",
        "পরীক্ষাটি সফলভাবে মুছে ফেলা হয়েছে।",
        "পরীক্ষা এবং সকল তথ্য সিস্টেম থেকে সরিয়ে ফেলা হয়েছে।"
      );
      console.log("Success Config:", successConfig);
      
      setModalConfig(successConfig);
      setShowSuccessModal(true);
      console.log("✓ Success modal should show now");
      
      setExamToDelete(null);
      
      console.log("✓ Reloading exams...");
      await loadExams();
      console.log("✅ Exams reloaded");
      
    } catch (error) {
      console.error("❌ Delete Error:", error);
      const err = error as { message?: string; detail?: string };
      console.error("Error Details:", err);
      
      setModalConfig(createErrorModal(
        "মুছে ফেলা ব্যর্থ!",
        "পরীক্ষা মুছে ফেলতে সমস্যা হয়েছে।",
        err.detail || err.message || "অনুগ্রহ করে আবার চেষ্টা করুন।"
      ));
      setShowErrorModal(true);
      setExamToDelete(null);
    }
    
    console.log("=== Delete Exam Ended ===");
  };

  const handleViewExam = async (examId: number) => {
    try {
      const examDetail = await apiService.getExamById(examId);
      setSelectedExam(examDetail);
      setShowExamDetailModal(true);
    } catch (error) {
      const err = error as { message?: string };
      setModalConfig(createErrorModal(
        "লোড ব্যর্থ!",
        "পরীক্ষার বিস্তারিত লোড করতে ব্যর্থ।",
        err.message || "অনুগ্রহ করে আবার চেষ্টা করুন।"
      ));
      setShowErrorModal(true);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setModalConfig(null);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setModalConfig(null);
  };

  const handleConfirmModalClose = () => {
    setShowConfirmModal(false);
    setExamToDelete(null);
    setModalConfig(null);
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
      {/* {user && (
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
      )} */}

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
                        className="flex-1 lg:flex-none px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[10px] sm:text-sm whitespace-nowrap"
                      >
                        বিস্তারিত দেখুন
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowAddQuestionModal(true);
                          }}
                          className="flex-1 lg:flex-none px-2 sm:px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-[10px] sm:text-sm whitespace-nowrap"
                        >
                          প্রশ্ন যোগ করুন
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setShowBulkUploadModal(true);
                          }}
                          className="flex-1 lg:flex-none px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-[10px] sm:text-sm whitespace-nowrap"
                        >
                          বাল্ক আপলোড
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteExamClick(exam.id)}
                        className="flex-1 lg:flex-none px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[10px] sm:text-sm whitespace-nowrap"
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

      {/* Create Exam Modal */}
      {showCreateModal && (
        <CreateExamModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadExams();
          }}
        />
      )}

      {/* Add Question Modal */}
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

      {/* Bulk Upload Modal */}
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

      {/* Exam Detail Modal */}
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

      {/* Success Modal */}
      {showSuccessModal && modalConfig && 'subtitle' in modalConfig && (
        <div className="fixed inset-0 z-[70]">
          <CustomModal
            isOpen={showSuccessModal}
            onClose={handleSuccessModalClose}
            title={modalConfig.title}
            message={modalConfig.message}
            description={modalConfig.description}
            type="success"
            buttons={[
              {
                label: 'ঠিক আছে',
                onClick: handleSuccessModalClose,
                variant: 'primary',
              },
            ]}
          />
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && modalConfig && 'subtitle' in modalConfig && (
        <div className="fixed inset-0 z-[70]">
          <CustomModal
            isOpen={showErrorModal}
            onClose={handleErrorModalClose}
            title={modalConfig.title}
            message={modalConfig.message}
            description={modalConfig.description}
            type="error"
            buttons={[
              {
                label: 'ঠিক আছে',
                onClick: handleErrorModalClose,
                variant: 'primary',
              },
            ]}
          />
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && modalConfig && 'buttons' in modalConfig && (
        <div className="fixed inset-0 z-[70]">
          <CustomModal
            isOpen={showConfirmModal}
            onClose={handleConfirmModalClose}
            title={modalConfig.title}
            message={modalConfig.message}
            description={modalConfig.description}
            type="confirm"
            buttons={modalConfig.buttons}
          />
        </div>
      )}
    </div>
  );
}