// Frontend/components/admin/AddQuestionModal.tsx

'use client';
import { useState } from 'react';
import apiService from '@/lib/api';

interface Exam {
  id: number;
  title: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  mark: number;
  minus_mark: number;
}

interface AddQuestionModalProps {
  exam: Exam;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddQuestionModal({ exam, onClose, onSuccess }: AddQuestionModalProps) {
  const [formData, setFormData] = useState({
    q_type: 'MCQ',
    content: '',
    options: ['', '', '', ''],
    answer_idx: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.addQuestionToExam(exam.id, formData);
      alert('প্রশ্ন সফলভাবে যোগ হয়েছে!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'প্রশ্ন যোগ করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto my-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">প্রশ্ন যোগ করুন</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{exam.title}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">প্রশ্ন *</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
              rows={3}
              placeholder="প্রশ্নটি লিখুন"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">অপশনসমূহ *</label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.answer_idx === index}
                    onChange={() => setFormData({ ...formData, answer_idx: index })}
                    className="w-4 h-4 text-indigo-600 mt-2 flex-shrink-0"
                  />
                  <input
                    type="text"
                    required
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                    placeholder={`অপশন ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">✓ সঠিক উত্তরটি সিলেক্ট করুন</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'যোগ হচ্ছে...' : 'প্রশ্ন যোগ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}