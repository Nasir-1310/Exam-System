// Frontend/components/admin/ExamDetailModal.tsx

'use client';
import { useState } from 'react';
import apiService from '@/lib/api';
import AddQuestionModal from './AddQuestionModal';

interface Question {
  id: number;
  q_type: string;
  content: string;
  image_url?: string;
  description?: string;
  options?: string[];
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_a_image_url?: string;
  option_b_image_url?: string;
  option_c_image_url?: string;
  option_d_image_url?: string;
  answer_idx?: number;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  mark: number;
  minus_mark: number;
  show_detailed_results_after?: string;
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
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  // ADDED: State for editing form
  const [editForm, setEditForm] = useState({
    content: '',
    image_url: '',
    description: '',
    options: ['', '', '', ''],
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_a_image_url: '',
    option_b_image_url: '',
    option_c_image_url: '',
    option_d_image_url: '',
    answer_idx: 0
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  // Upload to Google Drive via API
  const uploadToGoogleDrive = async (file: File): Promise<string> => {
    setUploadingImages(true);
    try {
      const result = await apiService.uploadImage(file);
      return result.direct_link; // Return direct link for immediate display
    } finally {
      setUploadingImages(false);
    }
  };
  const [isUpdating, setIsUpdating] = useState(false);

  // ADDED: State for editing exam
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [editExamForm, setEditExamForm] = useState({
    title: '',
    description: '',
    start_time: '',
    duration_minutes: 60,
    mark: 100,
    minus_mark: 0.25,
    show_detailed_results_after: '',
  });
  const [isUpdatingExam, setIsUpdatingExam] = useState(false);

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
      image_url: question.image_url || '',
      description: question.description || '',
      options: question.options ? [...question.options] : ['', '', '', ''],
      option_a: question.option_a || '',
      option_b: question.option_b || '',
      option_c: question.option_c || '',
      option_d: question.option_d || '',
      option_a_image_url: question.option_a_image_url || '',
      option_b_image_url: question.option_b_image_url || '',
      option_c_image_url: question.option_c_image_url || '',
      option_d_image_url: question.option_d_image_url || '',
      answer_idx: question.answer_idx || 0
    });
    setShowEditModal(true);
  };

  // ADDED: Edit exam handler
  const handleEditExam = () => {
    setEditExamForm({
      title: exam.title,
      description: exam.description,
      start_time: new Date(exam.start_time).toISOString().slice(0, 16), // Convert to datetime-local format
      duration_minutes: exam.duration_minutes,
      mark: exam.mark,
      minus_mark: exam.minus_mark,
      show_detailed_results_after: exam.show_detailed_results_after
        ? new Date(exam.show_detailed_results_after).toISOString().slice(0, 16)
        : '',
    });
    setShowEditExamModal(true);
  };

  // ADDED: Update exam function
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    // Basic validation - only require question content
    if (!editForm.content.trim()) {
      alert('প্রশ্ন লিখুন');
      return;
    }

    try {
      setIsUpdating(true);
      // ADDED: API call to update question with all fields
      await apiService.updateQuestion(exam.id, editingQuestion.id, {
        q_type: editingQuestion.q_type,
        content: editForm.content,
        image_url: editForm.image_url || null,
        description: editForm.description || null,
        options: editForm.options,
        option_a: editForm.option_a || null,
        option_b: editForm.option_b || null,
        option_c: editForm.option_c || null,
        option_d: editForm.option_d || null,
        option_a_image_url: editForm.option_a_image_url || null,
        option_b_image_url: editForm.option_b_image_url || null,
        option_c_image_url: editForm.option_c_image_url || null,
        option_d_image_url: editForm.option_d_image_url || null,
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

  // ADDED: Update exam function
  const handleUpdateExam = async () => {
    // Validation
    if (!editExamForm.title.trim()) {
      alert('পরীক্ষার শিরোনাম লিখুন');
      return;
    }

    if (!editExamForm.description.trim()) {
      alert('বর্ণনা লিখুন');
      return;
    }

    try {
      setIsUpdatingExam(true);
      const updateData = {
        ...editExamForm,
        show_detailed_results_after: editExamForm.show_detailed_results_after || null,
      };

      await apiService.updateExam(exam.id, updateData);

      alert('পরীক্ষা সফলভাবে আপডেট হয়েছে!');
      setShowEditExamModal(false);
      await onUpdate();
    } catch (error: any) {
      alert(error.message || 'পরীক্ষা আপডেট করতে ব্যর্থ');
    } finally {
      setIsUpdatingExam(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-8 border border-gray-100">
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{exam.title}</h2>
                  <p className="text-sm text-gray-600 mt-1 break-words">{exam.description}</p>
                </div>
              </div>
              
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
                {exam.show_detailed_results_after && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    বিস্তারিত ফলাফল: {new Date(exam.show_detailed_results_after).toLocaleDateString('bn-BD')}
                  </span>
                )}
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
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  প্রশ্নসমূহ ({exam.questions?.length || 0}টি প্রশ্ন)
                </h3>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddQuestionModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  প্রশ্ন যোগ করুন
                </button>
                <button
                  onClick={handleEditExam}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  পরীক্ষা সম্পাদনা
                </button>
              </div>
            </div>

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

                    {/* Question Image */}
                    {question.image_url && (
                      <div className="mb-3">
                        <img
                          src={question.image_url}
                          alt="Question"
                          className="max-w-full max-h-48 object-contain border border-gray-200 rounded-lg shadow-sm"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Question Description */}
                    {question.description && question.description.trim().length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-800 mb-1">📚 উত্তরের ব্যাখ্যা:</h5>
                        <p className="text-blue-900 text-sm leading-relaxed">{question.description}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((letter, optIndex) => {
                        const optionText = question[`option_${letter.toLowerCase()}` as keyof Question] as string;
                        const optionImage = question[`option_${letter.toLowerCase()}_image_url` as keyof Question] as string;
                        const isCorrect = question.answer_idx === optIndex;

                        return (
                          <div
                            key={optIndex}
                            className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm border ${
                              isCorrect
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`font-semibold flex-shrink-0 ${
                                isCorrect ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {letter}.
                              </span>
                              <div className="flex-1 space-y-2">
                                {/* Option Text */}
                                {optionText && (
                                  <span className={`block break-words ${
                                    isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'
                                  }`}>
                                    {optionText}
                                  </span>
                                )}

                                {/* Option Image */}
                                {optionImage && (
                                  <img
                                    src={optionImage}
                                    alt={`Option ${letter}`}
                                    className="max-w-32 max-h-32 object-contain border border-gray-200 rounded shadow-sm"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                )}
                              </div>

                              {/* Correct Answer Checkmark */}
                              {isCorrect && (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                  className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="প্রশ্ন লিখুন"
                />
              </div>

              {/* Question Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  প্রশ্নের ছবি (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  value={editForm.image_url}
                  onChange={(e) => {
                    const url = e.target.value;
                    // Convert Google Drive links to direct image URLs for preview
                    let displayUrl = url;
                    if (url.includes('drive.google.com')) {
                      if (url.includes('/file/d/')) {
                        const fileId = url.split('/file/d/')[1].split('/')[0];
                        displayUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                      } else if (url.includes('id=')) {
                        const fileId = url.split('id=')[1].split('&')[0];
                        displayUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                      }
                    }
                    setEditForm({ ...editForm, image_url: displayUrl });
                  }}
                  className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="ছবির URL লিখুন (Google Drive, ইত্যাদি)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  উত্তরের ব্যাখ্যা (ঐচ্ছিক)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={2}
                  placeholder="উত্তরের ব্যাখ্যা লিখুন"
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  অপশনসমূহ
                </label>
                {['A', 'B', 'C', 'D'].map((letter, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-600 w-8">
                        {letter}.
                      </span>
                      <input
                        type="text"
                        value={(editForm as any)[`option_${letter.toLowerCase()}`] || editForm.options[index] || ''}
                        onChange={(e) => {
                          const newOptions = [...editForm.options];
                          newOptions[index] = e.target.value;
                          setEditForm({
                            ...editForm,
                            options: newOptions,
                            [`option_${letter.toLowerCase()}`]: e.target.value
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                        placeholder={`অপশন ${letter} এর টেক্সট`}
                      />
                      <input
                        type="radio"
                        name="edit-correct-answer"
                        checked={editForm.answer_idx === index}
                        onChange={() => setEditForm({ ...editForm, answer_idx: index })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        title="সঠিক উত্তর"
                      />
                    </div>
                    <div>
                      <input
                        type="url"
                        value={(editForm as any)[`option_${letter.toLowerCase()}_image_url`] || ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          // Convert Google Drive links to direct image URLs for preview
                          let displayUrl = url;
                          if (url.includes('drive.google.com')) {
                            if (url.includes('/file/d/')) {
                              const fileId = url.split('/file/d/')[1].split('/')[0];
                              displayUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                            } else if (url.includes('id=')) {
                              const fileId = url.split('id=')[1].split('&')[0];
                              displayUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                            }
                          }
                          setEditForm({
                            ...editForm,
                            [`option_${letter.toLowerCase()}_image_url`]: displayUrl
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-700"
                        placeholder={`অপশন ${letter} এর ছবির URL (Google Drive, ইত্যাদি)`}
                      />
                    </div>
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

      {/* ADDED: Edit Exam Modal */}
      {showEditExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6 my-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">পরীক্ষা সম্পাদনা করুন</h2>
              <button
                onClick={() => setShowEditExamModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">পরীক্ষার শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={editExamForm.title}
                  onChange={(e) => setEditExamForm({ ...editExamForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">বর্ণনা *</label>
                <textarea
                  required
                  value={editExamForm.description}
                  onChange={(e) => setEditExamForm({ ...editExamForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">শুরুর তারিখ ও সময় *</label>
                  <input
                    type="datetime-local"
                    required
                    value={editExamForm.start_time}
                    onChange={(e) => setEditExamForm({ ...editExamForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">বিস্তারিত উত্তর প্রকাশের সময়</label>
                  <input
                    type="datetime-local"
                    value={editExamForm.show_detailed_results_after}
                    onChange={(e) => setEditExamForm({ ...editExamForm, show_detailed_results_after: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">এই সময়ের পর ছাত্ররা সঠিক উত্তর দেখতে পাবে</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">সময়কাল (মিনিট) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editExamForm.duration_minutes}
                    onChange={(e) => setEditExamForm({ ...editExamForm, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">মোট নম্বর *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editExamForm.mark}
                    onChange={(e) => setEditExamForm({ ...editExamForm, mark: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">মাইনাস মার্ক *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editExamForm.minus_mark}
                    onChange={(e) => setEditExamForm({ ...editExamForm, minus_mark: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditExamModal(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={handleUpdateExam}
                  disabled={isUpdatingExam}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isUpdatingExam ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <AddQuestionModal
          exam={exam}
          onClose={() => setShowAddQuestionModal(false)}
          onSuccess={() => {
            setShowAddQuestionModal(false);
            onUpdate(); // Refresh the exam data
          }}
        />
      )}
    </>
  );
}