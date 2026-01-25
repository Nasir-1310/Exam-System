// Frontend/components/admin/BulkQuestionUploadModal.tsx
"use client";

import { useState } from "react";
import apiService from "@/lib/api";
import { convertGoogleDriveUrl } from "@/lib/googleDriveUtils";
import CustomModal from "@/components/common/CustomModal";
import { createSuccessModal, createErrorModal } from "@/lib/modalHelpers";

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
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_a_image_url?: string;
  option_b_image_url?: string;
  option_c_image_url?: string;
  option_d_image_url?: string;
  answer?: string; // stores answer as letter (a-d) or index string
  parse_errors?: string[];
}

export default function BulkQuestionUploadModal({
  exam,
  onClose,
  onSuccess,
}: BulkQuestionUploadModalProps) {
  const [markdownContent, setMarkdownContent] = useState(`# Sample Format - Copy and modify
Q: What is the capital of Bangladesh?
A) Dhaka
B) Chittagong
C) Khulna
D) Rajshahi
ANSWER: a
DESCRIPTION: Dhaka is the capital and largest city of Bangladesh, located on the Buriganga River.

Q: Which of the following is a prime number?
A) 4
B) 6
C) 8
D) 11
ANSWER: c
DESCRIPTION: A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.

`);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState<"input" | "preview" | "saving">("input");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ReturnType<typeof createSuccessModal> | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleImageUpload = async (
    file: File,
    questionIndex: number,
    field: keyof ParsedQuestion
  ) => {
    const key = `${questionIndex}-${field}`;

    try {
      setUploading((prev) => ({ ...prev, [key]: true }));

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setModalConfig(createErrorModal(
          "অবৈধ ফাইল টাইপ!",
          "শুধুমাত্র ছবি আপলোড করুন",
          "সমর্থিত ফরম্যাট: JPG, PNG, GIF, WebP"
        ));
        setShowErrorModal(true);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setModalConfig(createErrorModal(
          "ফাইল অতিরিক্ত বড়!",
          "সর্বোচ্চ ৫ MB আকারের ছবি আপলোড করুন",
          `আপনার ফাইল: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
        ));
        setShowErrorModal(true);
        return;
      }

      const uploadedUrl = await apiService.uploadQuestionImage(file);

      setParsedQuestions((prev) => {
        const updated = [...prev];
        updated[questionIndex] = {
          ...updated[questionIndex],
          [field]: uploadedUrl,
        } as ParsedQuestion;
        return updated;
      });
    } catch (err) {
      const error = err as { message?: string };
      setModalConfig(createErrorModal(
        "আপলোড ব্যর্থ!",
        "ছবি আপলোড করতে সমস্যা হয়েছে",
        error.message || "আবার চেষ্টা করুন"
      ));
      setShowErrorModal(true);
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const parseMarkdown = (content: string): ParsedQuestion[] => {
    const questions: ParsedQuestion[] = [];
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let currentQuestion: Partial<ParsedQuestion> | null = null;
    let lastOptionIndex = -1;

    const optionKeys = ["option_a", "option_b", "option_c", "option_d"] as const;
    const optionImageKeys = [
      "option_a_image_url",
      "option_b_image_url",
      "option_c_image_url",
      "option_d_image_url",
    ] as const;

    for (const line of lines) {
      if (line.startsWith("Q:")) {
        if (currentQuestion?.content) {
          questions.push(currentQuestion as ParsedQuestion);
        }

        currentQuestion = {
          q_type: "MCQ",
          content: line.substring(2).trim(),
          parse_errors: [],
        };
        lastOptionIndex = -1;
        continue;
      }

      if (!currentQuestion) continue;

      if (line.startsWith("[image:")) {
        const imageUrl = line.match(/\[image:\s*(.*?)\s*\]/)?.[1];
        if (imageUrl) {
          if (lastOptionIndex >= 0) {
            const key = optionImageKeys[lastOptionIndex];
            if (key) (currentQuestion as Record<string, string>)[key] = imageUrl;
          } else {
            currentQuestion.image_url = imageUrl;
          }
        }
        continue;
      }

      if (line.startsWith("DESCRIPTION:")) {
        const description = line.substring("DESCRIPTION:".length).trim();
        if (description) currentQuestion.description = description;
        continue;
      }

      const optionMatch = line.match(/^([A-D])\)\s*(.*)$/);
      if (optionMatch) {
        const [, letter, text] = optionMatch;
        const optionIndex = letter.charCodeAt(0) - "A".charCodeAt(0);
        lastOptionIndex = optionIndex;
        const key = optionKeys[optionIndex];
        if (key) (currentQuestion as Record<string, string>)[key] = text;
        continue;
      }

      if (line.startsWith("ANSWER:")) {
        const answerRaw = line.substring("ANSWER:".length).trim().toLowerCase();
        currentQuestion.answer = answerRaw;
        continue;
      }

      if (
        line.toLowerCase().includes("write") ||
        line.toLowerCase().includes("explain") ||
        line.toLowerCase().includes("describe")
      ) {
        currentQuestion.q_type = "WRITTEN";
        continue;
      }
    }

    if (currentQuestion?.content) {
      questions.push(currentQuestion as ParsedQuestion);
    }

    return questions;
  };

  const handleParse = () => {
    if (!markdownContent.trim()) {
      setError("অনুগ্রহ করে প্রশ্নের কন্টেন্ট লিখুন");
      setModalConfig(createErrorModal(
        "কন্টেন্ট আবশ্যক!",
        "অনুগ্রহ করে প্রশ্নের কন্টেন্ট লিখুন",
        "প্রশ্ন ছাড়া পার্স করা সম্ভব নয়।"
      ));
      setShowErrorModal(true);
      return;
    }

    const parsed = parseMarkdown(markdownContent);
    if (parsed.length === 0) {
      setModalConfig(createErrorModal(
        "কোনো প্রশ্ন পাওয়া যায়নি!",
        "পার্সিং সফল হয়নি",
        "অনুগ্রহ করে সঠিক ফরম্যাট অনুসরণ করুন।"
      ));
      setShowErrorModal(true);
      return;
    }

    setParsedQuestions(parsed);
    setCurrentStep("preview");
    setError("");
  };

  const handleEditQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...parsedQuestions]; 
    (updated[index] as Record<string, string | number>)[field] = value;
    setParsedQuestions(updated);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setError("");
    setCurrentStep("saving");

    console.log("Saving questions:", parsedQuestions);

    try {
      let successCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < parsedQuestions.length; i++) {
        const question = parsedQuestions[i];
        if (question.parse_errors && question.parse_errors.length > 0) {
          continue;
        }

        // Validate MCQ requirements before sending
        if (question.q_type === "MCQ") {
          const optionTexts = [
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
          ].filter((opt) => (opt || "").toString().trim().length > 0);

          if (optionTexts.length < 2) {
            errors.push(`প্রশ্ন ${i + 1}: কমপক্ষে ২টি অপশন প্রয়োজন।`);
            continue;
          }
          const ans = (question.answer || "").trim().toLowerCase();
          const answerIdx = ans === "a" ? 0 : ans === "b" ? 1 : ans === "c" ? 2 : ans === "d" ? 3 : Number.isFinite(Number(ans)) ? Number(ans) : NaN;
          if (!Number.isInteger(answerIdx)) {
            errors.push(`প্রশ্ন ${i + 1}: সঠিক উত্তর নির্বাচন করা হয়নি (A/B/C/D বা 0-3)।`);
            continue;
          }
          if (answerIdx < 0 || answerIdx > 3) {
            errors.push(`প্রশ্ন ${i + 1}: ANSWER 0-3 এর মধ্যে বা A-D হতে হবে।`);
            continue;
          }
          // question.answer = (answerIdx).toString();
          console.log("Validated question answer:", question.answer);
          // return;
        }

        try {
          const questionData = {
            q_type: question.q_type,
            content: question.content,
            image_url: question.image_url || null,
            description: question.description || null,
            option_a: question.q_type === "MCQ" ? question.option_a : null,
            option_b: question.q_type === "MCQ" ? question.option_b : null,
            option_c: question.q_type === "MCQ" ? question.option_c : null,
            option_d: question.q_type === "MCQ" ? question.option_d : null,
            option_a_image_url: question.option_a_image_url || null,
            option_b_image_url: question.option_b_image_url || null,
            option_c_image_url: question.option_c_image_url || null,
            option_d_image_url: question.option_d_image_url || null,
            answer: question.q_type === "MCQ" ? question.answer : null,
          };

          await apiService.addQuestionToExam(exam.id, questionData);
          successCount++;
        } catch (err) {
          const error = err as { message?: string };
          errors.push(`প্রশ্ন ${i + 1}: ${error.message || "অজানা ত্রুটি"}`);
        }
      }

      if (successCount > 0) {
        setModalConfig(createSuccessModal(
          "প্রশ্নসমূহ যোগ হয়েছে!",
          `${successCount}টি প্রশ্ন সফলভাবে যোগ করা হয়েছে।`,
          errors.length > 0 ? `${errors.length}টি প্রশ্নে সমস্যা হয়েছে।` : "সব প্রশ্ন সফলভাবে যোগ হয়েছে!"
        ));
        setShowSuccessModal(true);
      } else {
        setModalConfig(createErrorModal(
          "প্রশ্ন যোগ ব্যর্থ!",
          "কোনো প্রশ্ন যোগ করা যায়নি।",
          errors.join("\n")
        ));
        setShowErrorModal(true);
        setCurrentStep("preview");
      }
    } catch (err) {
      const error = err as { message?: string; detail?: string };
      setModalConfig(createErrorModal(
        "প্রশ্নসমূহ সেভ করতে ব্যর্থ!",
        "প্রশ্নসমূহ সেভ করতে সমস্যা হয়েছে।",
        error.detail || error.message || "অনুগ্রহ করে আবার চেষ্টা করুন।"
      ));
      setShowErrorModal(true);
      setCurrentStep("preview");
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

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          প্রশ্ন প্রিভিউ ({parsedQuestions.length}টি)
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setCurrentStep("input")}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            সম্পাদনা করুন
          </button>
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? "সেভ হচ্ছে..." : "সব সেভ করুন"}
          </button>
        </div>
      </div>

      {parsedQuestions.map((question, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-indigo-300 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h4 className="font-semibold text-gray-900">প্রশ্ন {index + 1}</h4>
            <select
              value={question.q_type}
              onChange={(e) => handleEditQuestion(index, "q_type", e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              <option value="MCQ">MCQ</option>
              <option value="WRITTEN">লিখিত</option>
            </select>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                প্রশ্ন
              </label>
              <textarea
                value={question.content}
                onChange={(e) => handleEditQuestion(index, "content", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                প্রশ্নের ছবি (ঐচ্ছিক)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="flex flex-col items-center justify-center px-3 py-3 bg-white border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {uploading[`${index}-image_url`] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>PC থেকে আপলোড</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, index, "image_url");
                    }}
                    disabled={uploading[`${index}-image_url`]}
                  />
                </label>

                <input
                  type="url"
                  value={question.image_url || ""}
                  onChange={(e) => handleEditQuestion(index, "image_url", convertGoogleDriveUrl(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-sm"
                  placeholder="ছবি URL পেস্ট করুন"
                />
              </div>

              {question.image_url && (
                <div className="mt-2 relative w-full h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={convertGoogleDriveUrl(question.image_url)}
                    alt="Question"
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                উত্তরের ব্যাখ্যা (ঐচ্ছিক)
              </label>
              <textarea
                value={question.description || ""}
                onChange={(e) => handleEditQuestion(index, "description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                rows={2}
                placeholder="উত্তরের ব্যাখ্যা লিখুন..."
              />
            </div>

            {question.q_type === "MCQ" && (
              <div className="space-y-3">
                {["A", "B", "C", "D"].map((letter, optIndex) => {
                  const optionKey = `option_${letter.toLowerCase()}` as keyof ParsedQuestion;
                  const imageKey = `option_${letter.toLowerCase()}_image_url` as keyof ParsedQuestion;

                  return (
                    <div key={optIndex} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="radio"
                          name={`answer-${index}`}
                          checked={question.answer?.toLowerCase() === letter.toLowerCase()}
                          onChange={() => handleEditQuestion(index, "answer", letter.toLowerCase())}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="font-bold text-gray-700">{letter}.</span>
                        <input
                          type="text"
                          value={(question[optionKey] as string) || ""}
                          onChange={(e) => handleEditQuestion(index, optionKey, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                          placeholder={`অপশন ${letter}`}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <label className="flex flex-col items-center justify-center px-2 py-3 bg-white border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            {uploading[`${index}-${imageKey}`] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                            ) : (
                              <>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>PC থেকে আপলোড</span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, index, imageKey);
                            }}
                            disabled={uploading[`${index}-${imageKey}`]}
                          />
                        </label>

                        <input
                          type="url"
                          value={(question[imageKey] as string) || ""}
                          onChange={(e) => handleEditQuestion(index, imageKey, convertGoogleDriveUrl(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                          placeholder="ছবি URL (ঐচ্ছিক)"
                        />
                      </div>
                      {question[imageKey] && (
                        <div className="mt-2 relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={convertGoogleDriveUrl(question[imageKey] as string)}
                            alt={`Option ${letter}`}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {question.parse_errors && question.parse_errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
                <strong>পার্সিং ত্রুটি:</strong>
                <ul className="list-disc list-inside mt-1">
                  {question.parse_errors.map((errorMsg, i) => (
                    <li key={i}>{errorMsg}</li>
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
    <>
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  বাল্ক প্রশ্ন আপলোড
                </h2>
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

          {currentStep === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  মার্কডাউন ফরম্যাটে প্রশ্ন লিখুন
                </label>
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-mono text-sm"
                  rows={20}
                  placeholder={`Q: প্রশ্নের টেক্সট
[image: https://example.com/image.jpg] (ঐচ্ছিক)
A) অপশন A
B) অপশন B
C) অপশন C
D) অপশন D
ANSWER: 0 (সঠিক উত্তরের ইন্ডেক্স: 0=A, 1=B, 2=C, 3=D)
DESCRIPTION: উত্তরের ব্যাখ্যা (ঐচ্ছিক)

Q: পরবর্তী প্রশ্ন...`}
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ফরম্যাট নির্দেশনা:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><code className="bg-blue-100 px-2 py-0.5 rounded">Q:</code> দিয়ে প্রশ্ন শুরু করুন</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><code className="bg-blue-100 px-2 py-0.5 rounded">[image: URL]</code> দিয়ে ছবি যোগ করুন</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><code className="bg-blue-100 px-2 py-0.5 rounded">A) B) C) D)</code> দিয়ে অপশন লিখুন</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><code className="bg-blue-100 px-2 py-0.5 rounded">ANSWER: 0</code> দিয়ে সঠিক উত্তর নির্ধারণ করুন (0=A, 1=B, 2=C, 3=D)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><code className="bg-blue-100 px-2 py-0.5 rounded">DESCRIPTION:</code> দিয়ে উত্তরের ব্যাখ্যা যোগ করুন (ঐচ্ছিক)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>প্রত্যেক প্রশ্নের মধ্যে খালি লাইন রাখুন</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleParse}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
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

          {currentStep === "preview" && renderPreview()}

          {currentStep === "saving" && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">প্রশ্নসমূহ সেভ হচ্ছে...</p>
              <p className="text-gray-500 text-sm mt-2">অনুগ্রহ করে অপেক্ষা করুন</p>
            </div>
          )}
        </div>
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
              label: 'ঠিক আছে',
              onClick: handleErrorModalClose,
              variant: 'primary',
            },
          ]}
        />
      )}
    </>
  );
}