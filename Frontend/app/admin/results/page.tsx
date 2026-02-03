// Frontend/app/(admin)/results/page.tsx
'use client';

import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import ExamDropdown from '@/components/common/ExamDropdown';
import CustomModal from '@/components/common/CustomModal';

interface Result {
  id: number;
  exam_id: number;
  user_id: number;
  correct_answers: number;
  incorrect_answers: number;
  mark: number;
  submission_time: string;
  attempt_number: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  exam?: {
    id: number;
    title: string;
  };
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [deleting, setDeleting] = useState(false);
  
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
      const resultsData = await apiService.getAllResults();
      setResults(resultsData);
    } catch (error) {
      console.error('Failed to load results:', error);
      showError('ডেটা লোড করতে ব্যর্থ হয়েছে', 'সার্ভার থেকে তথ্য আনতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const displayedResults = results.filter(r => {
    if (!selectedExamId) return true;
    return r.exam_id === parseInt(selectedExamId);
  });

  const handleDeleteResult = async () => {
    if (!selectedResult) return;

    try {
      setDeleting(true);
      await apiService.deleteResult(selectedResult.id);
      
      setShowDeleteModal(false);
      setSelectedResult(null);
      
      // Remove from local state
      setResults(results.filter(r => r.id !== selectedResult.id));
      
      showSuccess(
        'ফলাফল মুছে ফেলা হয়েছে!',
        'ফলাফল সফলভাবে মুছে ফেলা হয়েছে।',
        'এই ফলাফল আর দেখা যাবে না।'
      );
    } catch (error: unknown) {
      const err = error as { message?: string };
      showError(
        'মুছে ফেলতে ব্যর্থ!',
        err.message || 'ফলাফল মুছে ফেলতে সমস্যা হয়েছে।',
        'অনুগ্রহ করে আবার চেষ্টা করুন।'
      );
    } finally {
      setDeleting(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ফলাফল পরিচালনা</h1>
        <p className="text-gray-600">সকল পরীক্ষার ফলাফল দেখুন এবং পরিচালনা করুন</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">মোট ফলাফল</p>
              <p className="text-3xl font-bold text-gray-900">{displayedResults.length}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-xl">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">গড় স্কোর</p>
              <p className="text-3xl font-bold text-gray-900">
                {displayedResults.length > 0 ? (displayedResults.reduce((sum, r) => sum + r.mark, 0) / displayedResults.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">সর্বোচ্চ স্কোর</p>
              <p className="text-3xl font-bold text-gray-900">
                {displayedResults.length > 0 ? Math.max(...displayedResults.map(r => r.mark)).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="mb-6">
        <ExamDropdown value={selectedExamId} onChange={setSelectedExamId} />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">সকল ফলাফল</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  পরীক্ষা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ব্যবহারকারী
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্কোর
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  সঠিক/ভুল
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  প্রচেষ্টা
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  সময়
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কাজ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    কোনো ফলাফল পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                displayedResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.exam?.title || `Exam ${result.exam_id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.user?.name || `User ${result.user_id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {result.mark.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.correct_answers}/{result.correct_answers + result.incorrect_answers}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.attempt_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(result.submission_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedResult(result);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors"
                      >
                        মুছে ফেলুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">ফলাফল মুছে ফেলবেন?</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedResult(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                আপনি কি নিশ্চিত যে এই ফলাফলটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
              </p>
              {selectedResult && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-black space-y-2">
                    <p><strong>পরীক্ষা:</strong> {selectedResult.exam?.title || `Exam ${selectedResult.exam_id}`}</p>
                    <p><strong>ব্যবহারকারী:</strong> {selectedResult.user?.name || `User ${selectedResult.user_id}`}</p>
                    <p><strong>স্কোর:</strong> {selectedResult.mark.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedResult(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteResult}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
              >
                {deleting ? 'মুছে ফেলা হচ্ছে...' : 'মুছে ফেলুন'}
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