// Frontend/components/admin/CreateExamModal.tsx

'use client';
import { useState, useEffect } from 'react';
import apiService from '@/lib/api';
import CustomModal from '@/components/common/CustomModal';
import { createSuccessModal, createErrorModal } from '@/lib/modalHelpers';

interface CreateExamModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

export default function CreateExamModal({ onClose, onSuccess }: CreateExamModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    duration_minutes: 60,
    mark: 100,
    minus_mark: 0.25,
    course_id: '',
    price: '',
    is_free: false,
    allow_multiple_attempts: false,
    show_detailed_results_after: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ReturnType<typeof createSuccessModal> | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await apiService.getAllCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('পরীক্ষার শিরোনাম আবশ্যক');
        setLoading(false);
        return;
      }
      if (!formData.start_time) {
        setError('শুরুর তারিখ ও সময় আবশ্যক');
        setLoading(false);
        return;
      }
      if (formData.duration_minutes <= 0) {
        setError('সময়কাল ০-এর বেশি হতে হবে');
        setLoading(false);
        return;
      }
      if (formData.mark <= 0) {
        setError('নম্বর ০-এর বেশি হতে হবে');
        setLoading(false);
        return;
      }
      if (!formData.is_free && formData.price && parseFloat(formData.price) < 0) {
        setError('মূল্য ০ বা তার বেশি হতে হবে');
        setLoading(false);
        return;
      }

      const submitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        start_time: formData.start_time ? `${formData.start_time}:00` : null,
        duration_minutes: formData.duration_minutes,
        mark: parseFloat(formData.mark.toString()),
        minus_mark: parseFloat(formData.minus_mark.toString()),
        course_id: formData.course_id && formData.course_id.trim() ? parseInt(formData.course_id) : null,
        is_active: true,
        price: formData.is_free ? null : formData.price ? parseFloat(formData.price) : null,
        is_free: formData.is_free,
        allow_multiple_attempts: formData.allow_multiple_attempts,
        show_detailed_results_after: formData.show_detailed_results_after ? `${formData.show_detailed_results_after}:00` : null,
        questions: [],
      };

      console.log('Submitting exam data:', submitData);

      await apiService.createExam(submitData);
      setModalConfig(createSuccessModal(
        'পরীক্ষা তৈরি হয়েছে!',
        'আপনার পরীক্ষা সফলভাবে তৈরি হয়েছে।',
        'আপনি এখন প্রশ্ন যোগ করতে পারেন।'
      ));
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Exam creation error:', err);
      const error = err as { response?: unknown; detail?: string; message?: string };
      console.error('Error response:', error.response);
      console.error('Error details:', error.message);
      setModalConfig(createErrorModal(
        'পরীক্ষা তৈরি ব্যর্থ!',
        'পরীক্ষা তৈরি করতে সমস্যা হয়েছে।',
        error.detail || error.message || 'অনুগ্রহ করে আবার চেষ্টা করুন।'
      ));
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onSuccess();
    onClose();
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 border border-gray-100  max-h-[95vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">নতুন পরীক্ষা তৈরি করুন</h2>
                <p className="text-sm text-gray-600 mt-1">পরীক্ষার বিস্তারিত তথ্য পূরণ করুন</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">পরীক্ষার শিরোনাম *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                placeholder="যেমন: 47th BCS Preliminary Mock Test"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">বর্ণনা *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                rows={3}
                placeholder="পরীক্ষা সম্পর্কে বিস্তারিত"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">কোর্স নির্বাচন (ঐচ্ছিক)</label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
              >
                <option value="">কোনো কোর্স নির্বাচন করবেন না</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">এই পরীক্ষাটি কোন কোর্সের সাথে যুক্ত হবে</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_free"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked, price: e.target.checked ? '' : formData.price })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_free" className="ml-2 block text-sm text-gray-900">
                  ফ্রি পরীক্ষা
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">মুল্য (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                  placeholder="যেমন: 500"
                  disabled={formData.is_free}
                />
                <p className="text-xs text-gray-500 mt-1">ফ্রি হলে ফাঁকা রাখুন</p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allow_multiple_attempts"
                checked={formData.allow_multiple_attempts}
                onChange={(e) => setFormData({ ...formData, allow_multiple_attempts: e.target.checked })}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="allow_multiple_attempts" className="ml-2 block text-sm text-gray-900">
                একাধিকবার অংশগ্রহণের অনুমতি দিন
              </label>
            </div>
            <p className="text-xs text-gray-500 -mt-2 mb-4">চেক করলে ছাত্ররা একাধিকবার পরীক্ষা দিতে পারবে</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">শুরুর তারিখ ও সময় *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">বিস্তারিত উত্তর প্রকাশের সময়</label>
                <input
                  type="datetime-local"
                  value={formData.show_detailed_results_after}
                  onChange={(e) => setFormData({ ...formData, show_detailed_results_after: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                  placeholder="যদি ফাঁকা রাখেন, কখনো দেখানো হবে না"
                />
                <p className="text-xs text-gray-500 mt-1">এই সময়ের পর ছাত্ররা সঠিক উত্তর দেখতে পাবে</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">সময়কাল (মিনিট) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">মোট নম্বর *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.mark}
                  onChange={(e) => setFormData({ ...formData, mark: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">মাইনাস মার্ক *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.minus_mark}
                  onChange={(e) => setFormData({ ...formData, minus_mark: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    পরীক্ষা তৈরি করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {modalConfig && (
          <CustomModal
            isOpen={showSuccessModal}
            onClose={handleSuccessModalClose}
            {...modalConfig}
            buttons={[
              {
                label: 'ঠিক আছে',
                onClick: handleSuccessModalClose,
                variant: 'primary',
              },
            ]}
          />
        )}

        {/* Error Modal */}
        {modalConfig && (
          <CustomModal
            isOpen={showErrorModal}
            onClose={handleErrorModalClose}
            {...modalConfig}
            buttons={[
              {
                label: 'আবার চেষ্টা করুন',
                onClick: handleErrorModalClose,
                variant: 'primary',
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}