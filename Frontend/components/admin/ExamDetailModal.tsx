// Frontend/components/admin/ExamDetailModal.tsx

'use client';
import { useState } from 'react';
import apiService from '@/lib/api';

interface Question {
  id: number;
  q_type: string;
  content: string;
  options: string[];
  answer_idx: number;
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

interface ExamDetailModalProps {
  exam: Exam;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ExamDetailModal({ exam, onClose, onUpdate }: ExamDetailModalProps) {
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  // ADDED: State for editing form
  const [editForm, setEditForm] = useState({
    content: '',
    options: ['', '', '', ''],
    answer_idx: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // UPDATED: Delete question function with API call
  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('আপনি কি নিশ্চিত এই প্রশ্ন মুছে ফেলতে চান?')) {
      return;
    }

    try {
      setDeletingQuestionId(questionId);
      // ADDED: API call to delete question
      await apiService.deleteQuestion(exam.id, questionId);
      alert('প্রশ্ন সফলভাবে মুছে ফেলা হয়েছে!');
      await onUpdate();
    } catch (error: any) {
      alert(error.message || 'প্রশ্ন মুছে ফেলতে ব্যর্থ');
    } finally {
      setDeletingQuestionId(null);
    }
  };

  // UPDATED: Edit question handler
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setEditForm({
      content: question.content,
      options: [...question.options],
      answer_idx: question.answer_idx
    });
    setShowEditModal(true);
  };

  // ADDED: Update question function
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    // Validation
    if (!editForm.content.trim()) {
      alert('প্রশ্ন লিখুন');
      return;
    }

    if (editForm.options.some(opt => !opt.trim())) {
      alert('সব অপশন পূরণ করুন');
      return;
    }

    try {
      setIsUpdating(true);
      // ADDED: API call to update question
      await apiService.updateQuestion(exam.id, editingQuestion.id, {
        q_type: editingQuestion.q_type,
        content: editForm.content,
        options: editForm.options,
        answer_idx: editForm.answer_idx
      });
      
      alert('প্রশ্ন সফলভাবে আপডেট হয়েছে!');
      setShowEditModal(false);
      setEditingQuestion(null);
      await onUpdate();
    } catch (error: any) {
      alert(error.message || 'প্রশ্ন আপডেট করতে ব্যর্থ');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-4xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto my-8">
          <div className="flex justify-between items-start mb-4 sm:mb-6">
            <div className="flex-1 min-w-0 mr-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{exam.title}</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{exam.description}</p>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  নম্বর: {exam.mark}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  মাইনাস: {exam.minus_mark}
                </span>
              </div>
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

          <div className="border-t pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              প্রশ্নসমূহ ({exam.questions?.length || 0}টি প্রশ্ন)
            </h3>

            {!exam.questions || exam.questions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm sm:text-base text-gray-600">এই পরীক্ষায় কোনো প্রশ্ন নেই</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">প্রশ্ন যোগ করুন button ক্লিক করে প্রশ্ন যোগ করুন</p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {exam.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base flex-1 break-words">
                        <span className="text-indigo-600 font-semibold">প্রশ্ন {index + 1}:</span> {question.content}
                      </h4>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={deletingQuestionId === question.id}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="মুছে ফেলুন"
                        >
                          {deletingQuestionId === question.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`flex items-start gap-2 p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                            question.answer_idx === optIndex
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span className={`font-semibold flex-shrink-0 ${
                            question.answer_idx === optIndex ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className={`flex-1 break-words ${
                            question.answer_idx === optIndex ? 'text-green-900 font-medium' : 'text-gray-700'
                          }`}>
                            {option}
                          </span>
                          {question.answer_idx === optIndex && (
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>

      {/* UPDATED: Edit Question Modal with full form */}
      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">প্রশ্ন সম্পাদনা</h3>
            
            <div className="space-y-4">
              {/* Question Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  প্রশ্ন
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="প্রশ্ন লিখুন"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  অপশনসমূহ
                </label>
                {editForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-600 w-8">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editForm.options];
                        newOptions[index] = e.target.value;
                        setEditForm({ ...editForm, options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={`অপশন ${String.fromCharCode(65 + index)}`}
                    />
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={editForm.answer_idx === index}
                      onChange={() => setEditForm({ ...editForm, answer_idx: index })}
                      className="w-5 h-5 text-indigo-600"
                      title="সঠিক উত্তর"
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  ✓ রেডিও বাটনে ক্লিক করে সঠিক উত্তর নির্বাচন করুন
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuestion(null);
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                বাতিল
              </button>
              <button
                onClick={handleUpdateQuestion}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  'আপডেট করুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}