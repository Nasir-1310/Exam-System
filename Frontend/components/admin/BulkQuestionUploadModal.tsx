// Frontend/components/admin/BulkQuestionUploadModal.tsx
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

interface BulkQuestionUploadModalProps {
  exam: Exam;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedQuestion {
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
  parse_errors?: string[];
}

export default function BulkQuestionUploadModal({ exam, onClose, onSuccess }: BulkQuestionUploadModalProps) {
  const [markdownContent, setMarkdownContent] = useState(`# Sample Format - Copy and modify

Q: What is the capital of Bangladesh?
[image: https://example.com/question-image.jpg]
A) Dhaka
B) Chittagong
C) Khulna
D) Rajshahi
ANSWER: 0
DESCRIPTION: Dhaka is the capital and largest city of Bangladesh, located on the Buriganga River.

Q: Which of the following is a prime number?
A) 4
B) 6
C) 8
D) 11
ANSWER: 3
DESCRIPTION: A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.

Q: Write a short note on climate change.
DESCRIPTION: Climate change refers to long-term shifts in temperatures and weather patterns.
`);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'saving'>('input');

  const parseMarkdown = (content: string): ParsedQuestion[] => {
    const questions: ParsedQuestion[] = [];
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);

    let currentQuestion: Partial<ParsedQuestion> = {};
    let parsingQuestion = false;

    for (const line of lines) {
      if (line.startsWith('Q:')) {
        // Save previous question if exists
        if (parsingQuestion && currentQuestion.content) {
          questions.push(currentQuestion as ParsedQuestion);
        }

        // Start new question
        currentQuestion = {
          q_type: 'MCQ',
          content: line.substring(2).trim(),
          parse_errors: []
        };
        parsingQuestion = true;
      } else if (line.startsWith('[image:')) {
        const imageUrl = line.match(/\[image:\s*(.*?)\s*\]/)?.[1];
        if (imageUrl) {
          if (currentQuestion.options) {
            // This is an option image - need to determine which option
            const lastOptionIndex = currentQuestion.options.length - 1;
            const imageKeys = ['option_a_image_url', 'option_b_image_url', 'option_c_image_url', 'option_d_image_url'];
            (currentQuestion as any)[imageKeys[lastOptionIndex]] = imageUrl;
          } else {
            // This is a question image
            currentQuestion.image_url = imageUrl;
          }
        }
      } else if (line.startsWith('DESCRIPTION:')) {
        const description = line.substring(12).trim();
        if (description) {
          currentQuestion.description = description;
        }
      } else if (line.match(/^[A-D]\)/)) {
        const optionMatch = line.match(/^([A-D])\)\s*(.*)$/);
        if (optionMatch) {
          const [, letter, text] = optionMatch;
          if (!currentQuestion.options) currentQuestion.options = [];
          if (!currentQuestion.option_a) currentQuestion.option_a = '';
          if (!currentQuestion.option_b) currentQuestion.option_b = '';
          if (!currentQuestion.option_c) currentQuestion.option_c = '';
          if (!currentQuestion.option_d) currentQuestion.option_d = '';

          const optionIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0);
          currentQuestion.options[optionIndex] = text;

          const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'];
          (currentQuestion as any)[optionKeys[optionIndex]] = text;
        }
      } else if (line.startsWith('ANSWER:')) {
        const answerMatch = line.match(/ANSWER:\s*(\d+)/);
        if (answerMatch) {
          currentQuestion.answer_idx = parseInt(answerMatch[1]);
        }
      } else if (line.toLowerCase().includes('write') || line.toLowerCase().includes('explain') || line.toLowerCase().includes('describe')) {
        currentQuestion.q_type = 'WRITTEN';
      }
    }

    // Add the last question
    if (parsingQuestion && currentQuestion.content) {
      questions.push(currentQuestion as ParsedQuestion);
    }

    return questions;
  };

  const handleParse = () => {
    if (!markdownContent.trim()) {
      setError('অনুগ্রহ করে প্রশ্নের কন্টেন্ট লিখুন');
      return;
    }

    const parsed = parseMarkdown(markdownContent);
    setParsedQuestions(parsed);
    setCurrentStep('preview');
    setError('');
  };

  const handleEditQuestion = (index: number, field: string, value: any) => {
    const updated = [...parsedQuestions];
    (updated[index] as any)[field] = value;
    setParsedQuestions(updated);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setError('');
    setCurrentStep('saving');

    try {
      let successCount = 0;
      for (const question of parsedQuestions) {
        if (question.parse_errors && question.parse_errors.length > 0) {
          continue; // Skip questions with errors
        }

        const questionData = {
          q_type: question.q_type,
          content: question.content,
          image_url: question.image_url || null,
          description: question.description || null,
          options: question.q_type === 'MCQ' ? question.options : null,
          option_a: question.q_type === 'MCQ' ? question.option_a : null,
          option_b: question.q_type === 'MCQ' ? question.option_b : null,
          option_c: question.q_type === 'MCQ' ? question.option_c : null,
          option_d: question.q_type === 'MCQ' ? question.option_d : null,
          option_a_image_url: question.option_a_image_url || null,
          option_b_image_url: question.option_b_image_url || null,
          option_c_image_url: question.option_c_image_url || null,
          option_d_image_url: question.option_d_image_url || null,
          answer_idx: question.q_type === 'MCQ' ? question.answer_idx : null,
        };

        await apiService.addQuestionToExam(exam.id, questionData);
        successCount++;
      }

      alert(`${successCount}টি প্রশ্ন সফলভাবে যোগ হয়েছে!`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'প্রশ্নসমূহ সেভ করতে ব্যর্থ');
      setCurrentStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">প্রশ্ন প্রিভিউ ({parsedQuestions.length}টি)</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStep('input')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            সম্পাদনা করুন
          </button>
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'সেভ হচ্ছে...' : 'সব সেভ করুন'}
          </button>
        </div>
      </div>

      {parsedQuestions.map((question, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-semibold">প্রশ্ন {index + 1}</h4>
            <select
              value={question.q_type}
              onChange={(e) => handleEditQuestion(index, 'q_type', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="MCQ">MCQ</option>
              <option value="WRITTEN">লিখিত</option>
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">প্রশ্ন</label>
              <textarea
                value={question.content}
                onChange={(e) => handleEditQuestion(index, 'content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                rows={2}
              />
            </div>

            {question.image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">প্রশ্নের ছবি</label>
                <input
                  type="url"
                  value={question.image_url}
                  onChange={(e) => handleEditQuestion(index, 'image_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <img
                  src={question.image_url}
                  alt="Question"
                  className="mt-2 max-h-32 object-contain border border-gray-200 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">উত্তরের ব্যাখ্যা (ঐচ্ছিক)</label>
              <textarea
                value={question.description || ''}
                onChange={(e) => handleEditQuestion(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                rows={2}
                placeholder="উত্তরের ব্যাখ্যা লিখুন..."
              />
            </div>

            {question.q_type === 'MCQ' && (
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((letter, optIndex) => {
                  const optionKey = `option_${letter.toLowerCase()}` as keyof ParsedQuestion;
                  const imageKey = `option_${letter.toLowerCase()}_image_url` as keyof ParsedQuestion;

                  return (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`answer-${index}`}
                        checked={question.answer_idx === optIndex}
                        onChange={() => handleEditQuestion(index, 'answer_idx', optIndex)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="font-bold">{letter}.</span>
                      <input
                        type="text"
                        value={(question as any)[optionKey] || ''}
                        onChange={(e) => handleEditQuestion(index, optionKey, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-gray-900"
                        placeholder={`অপশন ${letter}`}
                      />
                      <input
                        type="url"
                        value={(question as any)[imageKey] || ''}
                        onChange={(e) => handleEditQuestion(index, imageKey, e.target.value)}
                        className="w-32 px-2 py-2 border border-gray-300 rounded text-sm"
                        placeholder="ছবি URL"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {question.parse_errors && question.parse_errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
                <strong>পার্সিং ত্রুটি:</strong>
                <ul className="list-disc list-inside mt-1">
                  {question.parse_errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">বাল্ক প্রশ্ন আপলোড</h2>
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {currentStep === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                মার্কডাউন ফরম্যাটে প্রশ্ন লিখুন
              </label>
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-mono text-sm"
                rows={20}
                placeholder={`Q: প্রশ্নের টেক্সট
[image: https://example.com/image.jpg] (ঐচ্ছিক)
A) অপশন A
B) অপশন B
C) অপশন C
D) অপশন D
ANSWER: 0 (সঠিক উত্তরের ইন্ডেক্স: 0=A, 1=B, 2=C, 3=D)
DESCRIPTION: উত্তরের ব্যাখ্যা (ঐচ্ছিক - শুধু ফলাফল দেখার সময় দেখাবে)

Q: পরবর্তী প্রশ্ন...`}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">ফরম্যাট নির্দেশনা:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><code>Q:</code> দিয়ে প্রশ্ন শুরু করুন</li>
                <li><code>[image: URL]</code> দিয়ে ছবি যোগ করুন</li>
                <li><code>A) B) C) D)</code> দিয়ে অপশন লিখুন</li>
                <li><code>ANSWER: 0</code> দিয়ে সঠিক উত্তর নির্ধারণ করুন (0=A, 1=B, 2=C, 3=D)</li>
                <li><code>DESCRIPTION:</code> দিয়ে উত্তরের ব্যাখ্যা যোগ করুন (ঐচ্ছিক)</li>
                <li>প্রত্যেক প্রশ্নের মধ্যে খালি লাইন রাখুন</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleParse}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                প্রিভিউ দেখুন
              </button>
            </div>
          </div>
        )}

        {currentStep === 'preview' && renderPreview()}

        {currentStep === 'saving' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">প্রশ্নসমূহ সেভ হচ্ছে...</p>
          </div>
        )}
      </div>
    </div>
  );
}