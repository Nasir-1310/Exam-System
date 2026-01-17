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
    answer_idx: 0,
  });
  const [imageFiles, setImageFiles] = useState<{
    question?: File;
    option_a?: File;
    option_b?: File;
    option_c?: File;
    option_d?: File;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  // Upload to Google Drive via API
  const uploadToGoogleDrive = async (file: File): Promise<string> => {
    const result = await apiService.uploadImage(file);
    return result.direct_link; // Return direct link for immediate display
  };

  const handleFileUpload = async (field: string, file: File) => {
    if (!file) return;

    setUploadingImages(true);
    try {
      const imageUrl = await uploadToGoogleDrive(file);
      setFormData({ ...formData, [field]: imageUrl });
      setImageFiles({ ...imageFiles, [field.replace('_image_url', '')]: file });
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'] as const;
    setFormData({
      ...formData,
      options: newOptions,
      [optionKeys[index]]: value
    });
  };

  const handleImageUrlChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate that each option has either text or image
    if (formData.q_type === 'MCQ') {
      for (let i = 0; i < 4; i++) {
        const optionKey = `option_${String.fromCharCode(97 + i)}` as keyof typeof formData;
        const imageKey = `option_${String.fromCharCode(97 + i)}_image_url` as keyof typeof formData;
        const optionText = (formData as any)[optionKey] || '';
        const optionImage = (formData as any)[imageKey] || '';

        if (!optionText.trim() && !optionImage.trim()) {
          alert(`অপশন ${String.fromCharCode(65 + i)} এর জন্য টেক্সট অথবা ছবি প্রয়োজন`);
          return;
        }
      }
    }

    try {
      // Prepare the question data for API
      const questionData = {
        q_type: formData.q_type,
        content: formData.content,
        image_url: formData.image_url || null,
        description: formData.description || null,
        options: formData.q_type === 'MCQ' ? formData.options : null,
        option_a: formData.q_type === 'MCQ' ? formData.option_a : null,
        option_b: formData.q_type === 'MCQ' ? formData.option_b : null,
        option_c: formData.q_type === 'MCQ' ? formData.option_c : null,
        option_d: formData.q_type === 'MCQ' ? formData.option_d : null,
        option_a_image_url: formData.option_a_image_url || null,
        option_b_image_url: formData.option_b_image_url || null,
        option_c_image_url: formData.option_c_image_url || null,
        option_d_image_url: formData.option_d_image_url || null,
        answer_idx: formData.q_type === 'MCQ' ? formData.answer_idx : null,
      };

      await apiService.addQuestionToExam(exam.id, questionData);
      alert('প্রশ্ন সফলভাবে যোগ হয়েছে!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'প্রশ্ন যোগ করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">প্রশ্ন যোগ করুন</h2>
              <p className="text-sm text-gray-600 mt-1">{exam.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 flex-shrink-0"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">প্রশ্নের ছবি (ঐচ্ছিক)</label>
            <div className="space-y-2">
              <input
                type="url"
                value={formData.image_url}
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
                  setFormData({ ...formData, image_url: displayUrl });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                placeholder="ছবির URL লিখুন (Google Drive, ইত্যাদি)"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">অথবা</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('image_url', e.target.files[0])}
                  className="text-sm text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  disabled={uploadingImages}
                />
                {uploadingImages && <span className="text-sm text-indigo-600">আপলোড হচ্ছে...</span>}
              </div>
            </div>
            {formData.image_url && (
              <div className="mt-2">
                <img
                  src={formData.image_url}
                  alt="Question preview"
                  className="max-w-full max-h-48 object-contain border border-gray-200 rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">উত্তরের ব্যাখ্যা (ঐচ্ছিক)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
              rows={3}
              placeholder="পরীক্ষার্থী ফলাফল দেখার সময় এই ব্যাখ্যা দেখতে পাবে (পরীক্ষা দেওয়ার সময় দেখাবে না)"
            />
            <p className="text-xs text-gray-500 mt-1">এই ব্যাখ্যা শুধুমাত্র ফলাফল দেখার সময় প্রদর্শিত হবে</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">অপশনসমূহ *</label>
            <div className="space-y-4">
              {formData.options.map((option, index) => {
                const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'] as const;
                const imageKeys = ['option_a_image_url', 'option_b_image_url', 'option_c_image_url', 'option_d_image_url'] as const;
                const optionLabels = ['A', 'B', 'C', 'D'];

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.answer_idx === index}
                        onChange={() => setFormData({ ...formData, answer_idx: index })}
                        className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-700">{optionLabels[index]}.</span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm sm:text-base"
                          placeholder={`অপশন ${optionLabels[index]} এর টেক্সট (ঐচ্ছিক যদি ছবি থাকে)`}
                        />
                        </div>
                        <div className="space-y-1">
                          <input
                            type="url"
                            value={formData[imageKeys[index]]}
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
                              setFormData({ ...formData, [imageKeys[index]]: displayUrl });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                            placeholder={`অপশন ${optionLabels[index]} এর ছবির URL (Google Drive, ইত্যাদি)`}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(imageKeys[index], e.target.files[0])}
                            className="w-full text-xs text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            disabled={uploadingImages}
                          />
                          {formData[imageKeys[index]] && (
                            <div className="mt-2">
                              <img
                                src={formData[imageKeys[index]]}
                                alt={`Option ${optionLabels[index]} preview`}
                                className="max-w-full max-h-32 object-contain border border-gray-200 rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">✓ সঠিক উত্তরটি রেডিও বাটন দিয়ে সিলেক্ট করুন</p>
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
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  যোগ হচ্ছে...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  প্রশ্ন যোগ করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}