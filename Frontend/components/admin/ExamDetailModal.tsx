// Frontend/components/admin/ExamDetailModal.tsx

"use client";
import { useState } from "react";
import MathContentRenderer from '@/components/editor/MathContentRenderer';
import apiService from "@/lib/api";
import AddQuestionModal from "./AddQuestionModal";
import { convertGoogleDriveUrl } from "@/lib/googleDriveUtils";
import CustomModal from "@/components/common/CustomModal";
import {
  createSuccessModal,
  createErrorModal,
  createConfirmModal,
} from "@/lib/modalHelpers";

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

// ============================================================================
// ADDED: Helper functions for image handling
// ============================================================================
const getImageSrc = (imageUrl: string): string => {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    if (imageUrl.includes("drive.google.com")) {
      return convertGoogleDriveUrl(imageUrl);
    }
    return imageUrl;
  }

  if (imageUrl.startsWith("/uploads/")) {
    return `http://127.0.0.1:8000${imageUrl}`;
  }

  if (imageUrl.startsWith("/questions/") || imageUrl.startsWith("/")) {
    return imageUrl;
  }

  if (imageUrl.includes("drive.google.com")) {
    return convertGoogleDriveUrl(`https://${imageUrl}`);
  }

  return imageUrl;
};
// ============================================================================

export default function ExamDetailModal({
  exam,
  onClose,
  onUpdate,
}: ExamDetailModalProps) {
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState({
    content: "",
    image_url: "",
    description: "",
    options: ["", "", "", ""],
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_a_image_url: "",
    option_b_image_url: "",
    option_c_image_url: "",
    option_d_image_url: "",
    answer_idx: 0,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [editExamForm, setEditExamForm] = useState({
    title: "",
    description: "",
    start_time: "",
    duration_minutes: 60,
    mark: 100,
    minus_mark: 0.25,
    show_detailed_results_after: "",
  });
  const [isUpdatingExam, setIsUpdatingExam] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ReturnType<
    typeof createSuccessModal
  > | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleDeleteQuestion = async (questionId: number) => {
    setPendingDeleteId(questionId);
    setModalConfig(
      createConfirmModal(
        "প্রশ্ন মুছে ফেলবেন?",
        "আপনি কি নিশ্চিত যে এই প্রশ্নটি মুছে ফেলতে চান?",
        () => confirmDeleteQuestion(questionId),
        "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
        "হ্যাঁ, মুছে ফেলুন",
        "বাতিল করুন",
        () => {
          setShowConfirmModal(false);
          setPendingDeleteId(null);
        },
      ),
    );
    setShowConfirmModal(true);
  };

  const confirmDeleteQuestion = async (questionId: number) => {
    try {
      setShowConfirmModal(false);
      setDeletingQuestionId(questionId);
      await apiService.deleteQuestion(exam.id, questionId);

      setModalConfig(
        createSuccessModal(
          "প্রশ্ন মুছে ফেলা হয়েছে!",
          "প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।",
          "পরীক্ষা থেকে প্রশ্ন সরানো হয়েছে।",
        ),
      );
      setShowSuccessModal(true);
      await onUpdate();
    } catch (error: unknown) {
      const err = error as { message?: string; detail?: string };
      setModalConfig(
        createErrorModal(
          "প্রশ্ন মুছে ফেলা যায়নি!",
          "প্রশ্ন মুছে ফেলতে সমস্যা হয়েছে।",
          err.detail || err.message || "অনুগ্রহ করে আবার চেষ্টা করুন।",
        ),
      );
      setShowErrorModal(true);
    } finally {
      setDeletingQuestionId(null);
      setPendingDeleteId(null);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setEditForm({
      content: question.content,
      image_url: question.image_url || "",
      description: question.description || "",
      options: question.options ? [...question.options] : ["", "", "", ""],
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      option_a_image_url: question.option_a_image_url || "",
      option_b_image_url: question.option_b_image_url || "",
      option_c_image_url: question.option_c_image_url || "",
      option_d_image_url: question.option_d_image_url || "",
      answer_idx: question.answer_idx || 0,
    });
    setShowEditModal(true);
  };

  const handleEditExam = () => {
    setEditExamForm({
      title: exam.title,
      description: exam.description,
      start_time: new Date(exam.start_time).toISOString().slice(0, 16),
      duration_minutes: exam.duration_minutes,
      mark: exam.mark,
      minus_mark: exam.minus_mark,
      show_detailed_results_after: exam.show_detailed_results_after
        ? new Date(exam.show_detailed_results_after).toISOString().slice(0, 16)
        : "",
    });
    setShowEditExamModal(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    if (!editForm.content.trim()) {
      setModalConfig(
        createErrorModal(
          "প্রশ্ন আবশ্যক!",
          "অনুগ্রহ করে প্রশ্ন লিখুন",
          "প্রশ্ন ছাড়া সাবমিট করা সম্ভব নয়।",
        ),
      );
      setShowErrorModal(true);
      return;
    }

    try {
      setIsUpdating(true);
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
        answer_idx: editForm.answer_idx,
      });

      setModalConfig(
        createSuccessModal(
          "প্রশ্ন আপডেট হয়েছে!",
          "প্রশ্নটি সফলভাবে আপডেট করা হয়েছে।",
          "পরিবর্তনগুলো সংরক্ষিত হয়েছে।",
        ),
      );
      setShowSuccessModal(true);
      setShowEditModal(false);
      setEditingQuestion(null);
      await onUpdate();
    } catch (error: unknown) {
      const err = error as { message?: string; detail?: string };
      setModalConfig(
        createErrorModal(
          "প্রশ্ন আপডেট করা যায়নি!",
          "প্রশ্ন আপডেট করতে সমস্যা হয়েছে।",
          err.detail || err.message || "অনুগ্রহ করে আবার চেষ্টা করুন।",
        ),
      );
      setShowErrorModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateExam = async () => {
    if (!editExamForm.title.trim()) {
      setModalConfig(
        createErrorModal(
          "শিরোনাম আবশ্যক!",
          "পরীক্ষার শিরোনাম লিখুন",
          "শিরোনাম ছাড়া পরীক্ষা আপডেট করা সম্ভব নয়।",
        ),
      );
      setShowErrorModal(true);
      return;
    }

    if (!editExamForm.description.trim()) {
      setModalConfig(
        createErrorModal(
          "বর্ণনা আবশ্যক!",
          "পরীক্ষার বর্ণনা লিখুন",
          "বর্ণনা ছাড়া পরীক্ষা আপডেট করা সম্ভব নয়।",
        ),
      );
      setShowErrorModal(true);
      return;
    }

    try {
      setIsUpdatingExam(true);
      const updateData = {
        ...editExamForm,
        show_detailed_results_after:
          editExamForm.show_detailed_results_after || null,
      };

      await apiService.updateExam(exam.id, updateData);

      setModalConfig(
        createSuccessModal(
          "পরীক্ষা আপডেট হয়েছে!",
          "পরীক্ষা সফলভাবে আপডেট করা হয়েছে।",
          "সব পরিবর্তন সংরক্ষিত হয়েছে।",
        ),
      );
      setShowSuccessModal(true);
      setShowEditExamModal(false);
      await onUpdate();
    } catch (error: unknown) {
      const err = error as { message?: string; detail?: string };
      setModalConfig(
        createErrorModal(
          "পরীক্ষা আপডেট করা যায়নি!",
          "পরীক্ষা আপডেট করতে সমস্যা হয়েছে।",
          err.detail || err.message || "অনুগ্রহ করে আবার চেষ্টা করুন।",
        ),
      );
      setShowErrorModal(true);
    } finally {
      setIsUpdatingExam(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  const handleImageUrlChange = (url: string, field: string) => {
    let displayUrl = url;
    if (url.includes("drive.google.com")) {
      displayUrl = convertGoogleDriveUrl(url);
    }
    setEditForm((prev) => ({ ...prev, [field]: displayUrl }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto my-8 border border-gray-100">
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {exam.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 break-words">
                    {exam.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(exam.start_time).toLocaleDateString("bn-BD")}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {exam.duration_minutes} মিনিট
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                  </svg>
                  নম্বর: {exam.mark}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                  মাইনাস: {exam.minus_mark}
                </span>
                {exam.show_detailed_results_after && (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    বিস্তারিত ফলাফল:{" "}
                    {new Date(
                      exam.show_detailed_results_after,
                    ).toLocaleDateString("bn-BD")}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 flex-shrink-0"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  প্রশ্নসমূহ ({exam.questions?.length || 0}টি প্রশ্ন)
                </h3>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddQuestionModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  প্রশ্ন যোগ করুন
                </button>
                <button
                  onClick={handleEditExam}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  পরীক্ষা সম্পাদনা
                </button>
              </div>
            </div>

            {!exam.questions || exam.questions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm sm:text-base text-gray-600">
                  এই পরীক্ষায় কোনো প্রশ্ন নেই
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  প্রশ্ন যোগ করুন button ক্লিক করে প্রশ্ন যোগ করুন
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {exam.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="flex-1">
  <span className="text-indigo-600 font-semibold text-sm sm:text-base">
    প্রশ্ন {index + 1}:
  </span>
  <MathContentRenderer 
    content={question.content}
    className="mt-1 text-gray-900"
  />
</div>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={deletingQuestionId === question.id}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="মুছে ফেলুন"
                        >
                          {deletingQuestionId === question.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {question.image_url && (
                      <div className="mb-3 relative w-full max-w-lg mx-auto bg-gray-50 rounded-xl overflow-hidden">
                        <img
                          src={getImageSrc(question.image_url)}
                          alt="Question"
                          className="w-full h-64 object-contain"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = "none";
                            console.error(
                              "Question image failed to load:",
                              question.image_url,
                            );
                          }}
                          loading="lazy"
                        />
                      </div>
                    )}

                   {question.description && question.description.trim().length > 0 && (
  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <h5 className="text-sm font-medium text-blue-800 mb-1">
      📚 উত্তরের ব্যাখ্যা:
    </h5>
    <MathContentRenderer 
      content={question.description}
      className="text-blue-900 text-sm leading-relaxed"
    />
  </div>
)}

                    <div className="space-y-2">
                      {["A", "B", "C", "D"].map((letter, optIndex) => {
                        const optionText = question[
                          `option_${letter.toLowerCase()}` as keyof Question
                        ] as string;
                        const optionImage = question[
                          `option_${letter.toLowerCase()}_image_url` as keyof Question
                        ] as string;
                        const isCorrect = question.answer_idx === optIndex;

                        return (
                          <div
                            key={optIndex}
                            className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm border ${
                              isCorrect
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`font-semibold flex-shrink-0 ${
                                  isCorrect ? "text-green-700" : "text-gray-600"
                                }`}
                              >
                                {letter}.
                              </span>
                              <div className="flex-1 space-y-2">
                               {optionText && (
  <MathContentRenderer 
    content={optionText}
    className={`block ${
      isCorrect
        ? "text-green-900 font-medium"
        : "text-gray-700"
    }`}
  />
)}

                                {optionImage && (
                                  <div className="relative w-40 h-28 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                      src={getImageSrc(optionImage)}
                                      alt={`Option ${letter}`}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        const target =
                                          e.currentTarget as HTMLImageElement;
                                        target.style.display = "none";
                                        console.error(
                                          `Option ${letter} image failed to load:`,
                                          optionImage,
                                        );
                                      }}
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                              </div>

                              {isCorrect && (
                                <svg
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
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
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Edit Question Modal */}
      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  প্রশ্ন সম্পাদনা
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuestion(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  প্রশ্ন *
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  rows={3}
                  placeholder="প্রশ্ন লিখুন"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  প্রশ্নের ছবি (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  value={editForm.image_url}
                  onChange={(e) =>
                    handleImageUrlChange(e.target.value, "image_url")
                  }
                  onBlur={(e) =>
                    handleImageUrlChange(e.target.value, "image_url")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="ছবির URL বা Google Drive লিংক"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Google Drive লিংক স্বয়ংক্রিয়ভাবে রূপান্তরিত হবে
                </p>
                {editForm.image_url && (
                  <div className="mt-2 relative w-full bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={getImageSrc(editForm.image_url)}
                      alt="Question Preview"
                      className="w-full h-48 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                        console.error(
                          "Edit form question image failed to load:",
                          editForm.image_url,
                        );
                      }}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  উত্তরের ব্যাখ্যা (ঐচ্ছিক)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  rows={2}
                  placeholder="উত্তরের ব্যাখ্যা লিখুন"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  অপশনসমূহ
                </label>
                {["A", "B", "C", "D"].map((letter, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 mb-3 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-600 w-8">
                        {letter}.
                      </span>
                      <input
                        type="text"
                        value={
                          (editForm as unknown as Record<string, string>)[
                            `option_${letter.toLowerCase()}`
                          ] ||
                          editForm.options[index] ||
                          ""
                        }
                        onChange={(e) => {
                          const newOptions = [...editForm.options];
                          newOptions[index] = e.target.value;
                          setEditForm({
                            ...editForm,
                            options: newOptions,
                            [`option_${letter.toLowerCase()}`]: e.target.value,
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        placeholder={`অপশন ${letter} এর টেক্সট`}
                      />
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="edit-correct-answer"
                          checked={editForm.answer_idx === index}
                          onChange={() =>
                            setEditForm({ ...editForm, answer_idx: index })
                          }
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          title="সঠিক উত্তর"
                        />
                        <span className="ml-2 text-xs text-gray-500">সঠিক</span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="url"
                        value={
                          (editForm as unknown as Record<string, string>)[
                            `option_${letter.toLowerCase()}_image_url`
                          ] || ""
                        }
                        onChange={(e) =>
                          handleImageUrlChange(
                            e.target.value,
                            `option_${letter.toLowerCase()}_image_url`,
                          )
                        }
                        onBlur={(e) =>
                          handleImageUrlChange(
                            e.target.value,
                            `option_${letter.toLowerCase()}_image_url`,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                        placeholder={`অপশন ${letter} এর ছবির URL`}
                      />
                      {(editForm as unknown as Record<string, string>)[
                        `option_${letter.toLowerCase()}_image_url`
                      ] && (
                        <div className="mt-2 relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden">
                          <img
                            src={getImageSrc(
                              (editForm as unknown as Record<string, string>)[
                                `option_${letter.toLowerCase()}_image_url`
                              ],
                            )}
                            alt={`Option ${letter}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target =
                                e.currentTarget as HTMLImageElement;
                              target.style.display = "none";
                              console.error(
                                `Edit form option ${letter} image failed to load`,
                              );
                            }}
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  ✓ রেডিও বাটনে ক্লিক করে সঠিক উত্তর নির্বাচন করুন
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingQuestion(null);
                }}
                disabled={isUpdating}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all duration-200 font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleUpdateQuestion}
                disabled={isUpdating}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    আপডেট করুন
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Exam Modal */}
      {showEditExamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  পরীক্ষা সম্পাদনা করুন
                </h2>
              </div>
              <button
                onClick={() => setShowEditExamModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পরীক্ষার শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  value={editExamForm.title}
                  onChange={(e) =>
                    setEditExamForm({ ...editExamForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  বর্ণনা *
                </label>
                <textarea
                  required
                  value={editExamForm.description}
                  onChange={(e) =>
                    setEditExamForm({
                      ...editExamForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    শুরুর তারিখ ও সময় *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editExamForm.start_time}
                    onChange={(e) =>
                      setEditExamForm({
                        ...editExamForm,
                        start_time: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    বিস্তারিত উত্তর প্রকাশের সময়
                  </label>
                  <input
                    type="datetime-local"
                    value={editExamForm.show_detailed_results_after}
                    onChange={(e) =>
                      setEditExamForm({
                        ...editExamForm,
                        show_detailed_results_after: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    এই সময়ের পর ছাত্ররা সঠিক উত্তর দেখতে পাবে
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    সময়কাল (মিনিট) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editExamForm.duration_minutes}
                    onChange={(e) =>
                      setEditExamForm({
                        ...editExamForm,
                        duration_minutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    মোট নম্বর *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editExamForm.mark}
                    onChange={(e) =>
                      setEditExamForm({
                        ...editExamForm,
                        mark: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    মাইনাস মার্ক *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editExamForm.minus_mark}
                    onChange={(e) =>
                      setEditExamForm({
                        ...editExamForm,
                        minus_mark: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditExamModal(false)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={handleUpdateExam}
                  disabled={isUpdatingExam}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  {isUpdatingExam ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      আপডেট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      আপডেট করুন
                    </>
                  )}
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
            onUpdate();
          }}
        />
      )}

      {/* Success Modal */}
      {modalConfig && (
        <CustomModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          {...modalConfig}
          buttons={[
            {
              label: "ঠিক আছে",
              onClick: handleSuccessModalClose,
              variant: "primary",
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
              label: "ঠিক আছে",
              onClick: handleErrorModalClose,
              variant: "primary",
            },
          ]}
        />
      )}

      {/* Confirm Modal */}
      {modalConfig && showConfirmModal && (
        <CustomModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setPendingDeleteId(null);
          }}
          {...modalConfig}
        />
      )}
    </>
  );
}
