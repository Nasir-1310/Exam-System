// Frontend/components/admin/AddQuestionModal.tsx
"use client";

import apiService from "@/lib/api";
import { convertGoogleDriveUrl } from "@/lib/googleDriveUtils";
import { useState } from "react";
import CustomModal from "@/components/common/CustomModal";
import { createSuccessModal, createErrorModal } from "@/lib/modalHelpers";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface AddQuestionModalProps {
  exam: {
    id: number;
    title: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddQuestionModal({
  exam,
  onClose,
  onSuccess,
}: AddQuestionModalProps) {
  const [questionType, setQuestionType] = useState<"MCQ" | "WRITTEN">("MCQ");
  const [formData, setFormData] = useState({
    content: "",
    image_url: "",
    description: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_a_image_url: "",
    option_b_image_url: "",
    option_c_image_url: "",
    option_d_image_url: "",
    answer: "",
  });
  
  const [uploadingFiles, setUploadingFiles] = useState<{
    question: boolean;
    option_a: boolean;
    option_b: boolean;
    option_c: boolean;
    option_d: boolean;
  }>({
    question: false,
    option_a: false,
    option_b: false,
    option_c: false,
    option_d: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ReturnType<typeof createSuccessModal> | null>(null);

  const handleImageUrlChange = (url: string, field: string) => {
    let displayUrl = url.trim();
    
    if (displayUrl.includes("drive.google.com")) {
      displayUrl = convertGoogleDriveUrl(displayUrl);
    }
    
    setFormData((prev) => ({ ...prev, [field]: displayUrl }));
  };

  const handleFileUpload = async (
    file: File,
    fieldName: "image_url" | "option_a_image_url" | "option_b_image_url" | "option_c_image_url" | "option_d_image_url"
  ) => {
    const uploadKey = fieldName === "image_url" ? "question" : fieldName.replace("_image_url", "") as keyof typeof uploadingFiles;
    
    try {
      setUploadingFiles((prev) => ({ ...prev, [uploadKey]: true }));

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
      
      setFormData((prev) => ({
        ...prev,
        [fieldName]: uploadedUrl,
      }));

    } catch (error) {
      console.error("❌ Upload error:", error);
      const err = error as { message?: string };
      setModalConfig(createErrorModal(
        "আপলোড ব্যর্থ!",
        "ছবি আপলোড করতে সমস্যা হয়েছে",
        err.message || "আবার চেষ্টা করুন"
      ));
      setShowErrorModal(true);
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

     console.log("📤 Submitting question with content:", formData.content);
  console.log("📤 Submitting question with description:", formData.description);

    if (!formData.content.trim()) {
      setModalConfig(createErrorModal(
        "প্রশ্ন আবশ্যক!",
        "অনুগ্রহ করে প্রশ্ন লিখুন",
        "প্রশ্ন ছাড়া সেভ করা সম্ভব নয়।"
      ));
      setShowErrorModal(true);
      return;
    }

    if (questionType === "MCQ") {
      const filledOptions = [
        formData.option_a,
        formData.option_b,
        formData.option_c,
        formData.option_d,
      ].filter((opt) => opt.trim()).length;

      if (filledOptions < 2) {
        setModalConfig(createErrorModal(
          "অপশন আবশ্যক!",
          "কমপক্ষে ২টি অপশন দিন",
          "MCQ প্রশ্নের জন্য কমপক্ষে ২টি অপশন প্রয়োজন।"
        ));
        setShowErrorModal(true);
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const questionData = {
        q_type: questionType,
        content: formData.content, // Rich HTML content
        image_url: formData.image_url || null,
        description: formData.description || null, // Rich HTML content
        options:
          questionType === "MCQ"
            ? [
                formData.option_a,
                formData.option_b,
                formData.option_c,
                formData.option_d,
              ]
            : null,
        option_a: questionType === "MCQ" ? formData.option_a || null : null,
        option_b: questionType === "MCQ" ? formData.option_b || null : null,
        option_c: questionType === "MCQ" ? formData.option_c || null : null,
        option_d: questionType === "MCQ" ? formData.option_d || null : null,
        option_a_image_url:
          questionType === "MCQ" ? formData.option_a_image_url || null : null,
        option_b_image_url:
          questionType === "MCQ" ? formData.option_b_image_url || null : null,
        option_c_image_url:
          questionType === "MCQ" ? formData.option_c_image_url || null : null,
        option_d_image_url:
          questionType === "MCQ" ? formData.option_d_image_url || null : null,
        answer: questionType === "MCQ" ? formData.answer : null,
      };

      await apiService.addQuestionToExam(exam.id, questionData);
      
      setFormData({
        content: "",
        image_url: "",
        description: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        option_a_image_url: "",
        option_b_image_url: "",
        option_c_image_url: "",
        option_d_image_url: "",
        answer: 0,
      });
      
      const successConfig = createSuccessModal(
        "প্রশ্ন যোগ হয়েছে!",
        "প্রশ্নটি সফলভাবে পরীক্ষায় যোগ করা হয়েছে।",
        "আপনার প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে।"
      );
      
      setModalConfig(successConfig);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("❌ Error:", error);
      const err = error as { message?: string; detail?: string };
      
      setModalConfig(createErrorModal(
        "প্রশ্ন যোগ করা যায়নি!",
        "প্রশ্নটি যোগ করতে সমস্যা হয়েছে।",
        err.detail || err.message || "অনুগ্রহ করে তথ্যগুলো চেক করে আবার চেষ্টা করুন।"
      ));
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setModalConfig(null);
    onSuccess();
    onClose();
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
    setModalConfig(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
        <div className="bg-white rounded-lg max-w-4xl w-full p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              নতুন প্রশ্ন যোগ করুন
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Question Type Selection */}
            <div>
              <label className="block  text-sm font-medium text-gray-700 mb-2">
                প্রশ্নের ধরন
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="MCQ"
                    checked={questionType === "MCQ"}
                    onChange={(e) =>
                      setQuestionType(e.target.value as "MCQ" | "WRITTEN")
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700">MCQ (বহুনির্বাচনী)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="WRITTEN"
                    checked={questionType === "WRITTEN"}
                    onChange={(e) =>
                      setQuestionType(e.target.value as "MCQ" | "WRITTEN")
                    }
                    className="mr-2"
                  />
                  <span className="text-gray-700">Written (লিখিত)</span>
                </label>
              </div>
            </div>

            {/* Question Content - Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                প্রশ্ন * <span className="text-xs text-gray-900">(Bold, Italic, Math formula সমর্থিত)</span>
              </label>
              <RichTextEditor
              
                value={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="প্রশ্ন লিখুন... (Math formula এর জন্য 𝑓(𝑥) button ব্যবহার করুন)"
                minHeight="200px"
              />
            </div>

            {/* Question Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                প্রশ্নের ছবি (ঐচ্ছিক)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingFiles.question ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">PC থেকে আপলোড</span>
                          </p>
                          <p className="text-xs text-gray-400">JPG, PNG (max 5MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "image_url");
                      }}
                      disabled={uploadingFiles.question}
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => handleImageUrlChange(e.target.value, "image_url")}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                    placeholder="অথবা Google Drive লিংক পেস্ট করুন"
                  />
                </div>
              </div>

              {formData.image_url && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">প্রিভিউ:</p>
                  <div className="relative w-full h-48 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                    <img
                      src={formData.image_url}
                      alt="Question Preview"
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Description/Explanation - Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                উত্তরের ব্যাখ্যা (ঐচ্ছিক) <span className="text-xs text-gray-500">(Rich formatting সমর্থিত)</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="উত্তরের ব্যাখ্যা লিখুন (ফলাফলে দেখানো হবে)"
                minHeight="150px"
              />
            </div>

            {/* MCQ Options */}
            {questionType === "MCQ" && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  অপশনসমূহ (কমপক্ষে ২টি) *
                </label>

                {["A", "B", "C", "D"].map((letter, index) => (
                  <div
                    key={letter}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-600 w-8">
                        {letter}.
                      </span>
                      <input
                        type="text"
                        value={
                          formData[
                            `option_${letter.toLowerCase()}` as keyof typeof formData
                          ]
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`option_${letter.toLowerCase()}`]: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 bg-white"
                        placeholder={`অপশন ${letter} এর টেক্সট`}
                      />
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={formData.answer?.toLocaleLowerCase() === letter?.toLocaleLowerCase()}
                        onChange={() =>
                          setFormData({ ...formData, answer: letter })
                        }
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        title="সঠিক উত্তর"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                      <label className="flex flex-col items-center justify-center px-2 py-3 bg-white border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2">
                          {uploadingFiles[`option_${letter.toLowerCase()}` as keyof typeof uploadingFiles] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs text-gray-500">PC থেকে আপলোড</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, `option_${letter.toLowerCase()}_image_url` as any);
                            }
                          }}
                          disabled={uploadingFiles[`option_${letter.toLowerCase()}` as keyof typeof uploadingFiles]}
                        />
                      </label>

                      <input
                        type="text"
                        value={
                          formData[
                            `option_${letter.toLowerCase()}_image_url` as keyof typeof formData
                          ]
                        }
                        onChange={(e) =>
                          handleImageUrlChange(
                            e.target.value,
                            `option_${letter.toLowerCase()}_image_url`,
                          )
                        }
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs text-gray-700 bg-white"
                        placeholder="অথবা লিংক পেস্ট করুন"
                      />
                    </div>

                    {formData[
                      `option_${letter.toLowerCase()}_image_url` as keyof typeof formData
                    ] && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">প্রিভিউ:</p>
                        <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                          <img
                            src={formData[
                              `option_${letter.toLowerCase()}_image_url` as keyof typeof formData
                            ] as string}
                            alt={`Option ${letter} Preview`}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <p className="text-xs text-gray-500">
                  ✓ রেডিও বাটনে ক্লিক করে সঠিক উত্তর নির্বাচন করুন
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    যোগ হচ্ছে...
                  </>
                ) : (
                  "প্রশ্ন যোগ করুন"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && modalConfig && (
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
      {showErrorModal && modalConfig && (
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
    </>
  );
}



// // Frontend/components/admin/AddQuestionModal.tsx
// "use client";

// import apiService from "@/lib/api";
// import { convertGoogleDriveUrl } from "@/lib/googleDriveUtils";
// import { useState } from "react";
// import Image from "next/image";
// import CustomModal from "@/components/common/CustomModal";
// import { createSuccessModal, createErrorModal } from "@/lib/modalHelpers";

// interface AddQuestionModalProps {
//   exam: {
//     id: number;
//     title: string;
//   };
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function AddQuestionModal({
//   exam,
//   onClose,
//   onSuccess,
// }: AddQuestionModalProps) {
//   const [questionType, setQuestionType] = useState<"MCQ" | "WRITTEN">("MCQ");
//   const [formData, setFormData] = useState({
//     content: "",
//     image_url: "",
//     description: "",
//     option_a: "",
//     option_b: "",
//     option_c: "",
//     option_d: "",
//     option_a_image_url: "",
//     option_b_image_url: "",
//     option_c_image_url: "",
//     option_d_image_url: "",
//     answer_idx: 0,
//   });
  
//   // File upload states
//   const [uploadingFiles, setUploadingFiles] = useState<{
//     question: boolean;
//     option_a: boolean;
//     option_b: boolean;
//     option_c: boolean;
//     option_d: boolean;
//   }>({
//     question: false,
//     option_a: false,
//     option_b: false,
//     option_c: false,
//     option_d: false,
//   });

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [modalConfig, setModalConfig] = useState<ReturnType<typeof createSuccessModal> | null>(null);

//   // ============================================================================
//   // MODIFIED: Helper function to handle image URL changes
//   // Now properly handles both Google Drive URLs and local uploaded image paths
//   // ============================================================================
//   const handleImageUrlChange = (url: string, field: string) => {
//     let displayUrl = url.trim();
    
//     // Only convert Google Drive URLs, leave local paths (/questions/) unchanged
//     if (displayUrl.includes("drive.google.com")) {
//       displayUrl = convertGoogleDriveUrl(displayUrl);
//     }
//     // Local uploaded images starting with /questions/ remain unchanged
    
//     setFormData((prev) => ({ ...prev, [field]: displayUrl }));
//   };
//   // ============================================================================
//   // END MODIFICATION
//   // ============================================================================

//   // ============================================================================
//   // MODIFIED: Handle file upload from PC
//   // Added better error handling and logging
//   // ============================================================================
//   const handleFileUpload = async (
//     file: File,
//     fieldName: "image_url" | "option_a_image_url" | "option_b_image_url" | "option_c_image_url" | "option_d_image_url"
//   ) => {
//     const uploadKey = fieldName === "image_url" ? "question" : fieldName.replace("_image_url", "") as keyof typeof uploadingFiles;
    
//     try {
//       setUploadingFiles((prev) => ({ ...prev, [uploadKey]: true }));

//       console.log("=== Starting File Upload ===");
//       console.log("Field Name:", fieldName);
//       console.log("File Name:", file.name);
//       console.log("File Size:", file.size);
//       console.log("File Type:", file.type);

//       // Validate file type
//       const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
//       if (!validTypes.includes(file.type)) {
//         console.error("Invalid file type:", file.type);
//         setModalConfig(createErrorModal(
//           "অবৈধ ফাইল টাইপ!",
//           "শুধুমাত্র ছবি আপলোড করুন",
//           "সমর্থিত ফরম্যাট: JPG, PNG, GIF, WebP"
//         ));
//         setShowErrorModal(true);
//         return;
//       }

//       // Validate file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         console.error("File too large:", file.size);
//         setModalConfig(createErrorModal(
//           "ফাইল অতিরিক্ত বড়!",
//           "সর্বোচ্চ ৫ MB আকারের ছবি আপলোড করুন",
//           `আপনার ফাইল: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
//         ));
//         setShowErrorModal(true);
//         return;
//       }

//       // Upload the file
//       console.log("Calling apiService.uploadQuestionImage...");
//       const uploadedUrl = await apiService.uploadQuestionImage(file);
//       console.log("Upload successful! URL:", uploadedUrl);
      
//       // Update form data with the uploaded URL
//       setFormData((prev) => ({
//         ...prev,
//         [fieldName]: uploadedUrl,
//       }));

//       console.log("✅ File uploaded and form updated");

//     } catch (error) {
//       console.error("❌ Upload error:", error);
//       const err = error as { message?: string };
//       setModalConfig(createErrorModal(
//         "আপলোড ব্যর্থ!",
//         "ছবি আপলোড করতে সমস্যা হয়েছে",
//         err.message || "আবার চেষ্টা করুন"
//       ));
//       setShowErrorModal(true);
//     } finally {
//       setUploadingFiles((prev) => ({ ...prev, [uploadKey]: false }));
//     }
//   };
//   // ============================================================================
//   // END FILE UPLOAD MODIFICATION
//   // ============================================================================

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     console.log("=== Form Submit Started ===");
//     console.log("Question Type:", questionType);
//     console.log("Form Data:", formData);

//     // Validation
//     if (!formData.content.trim()) {
//       console.log("❌ Validation Failed: No content");
//       setModalConfig(createErrorModal(
//         "প্রশ্ন আবশ্যক!",
//         "অনুগ্রহ করে প্রশ্ন লিখুন",
//         "প্রশ্ন ছাড়া সেভ করা সম্ভব নয়।"
//       ));
//       setShowErrorModal(true);
//       return;
//     }

//     if (questionType === "MCQ") {
//       // Check if at least 2 options are provided
//       const filledOptions = [
//         formData.option_a,
//         formData.option_b,
//         formData.option_c,
//         formData.option_d,
//       ].filter((opt) => opt.trim()).length;

//       console.log("Filled Options Count:", filledOptions);

//       if (filledOptions < 2) {
//         console.log("❌ Validation Failed: Not enough options");
//         setModalConfig(createErrorModal(
//           "অপশন আবশ্যক!",
//           "কমপক্ষে ২টি অপশন দিন",
//           "MCQ প্রশ্নের জন্য কমপক্ষে ২টি অপশন প্রয়োজন।"
//         ));
//         setShowErrorModal(true);
//         return;
//       }
//     }

//     try {
//       setIsSubmitting(true);
//       console.log("✓ Validation Passed, preparing data...");

//       const questionData = {
//         q_type: questionType,
//         content: formData.content,
//         image_url: formData.image_url || null,
//         description: formData.description || null,
//         options:
//           questionType === "MCQ"
//             ? [
//                 formData.option_a,
//                 formData.option_b,
//                 formData.option_c,
//                 formData.option_d,
//               ]
//             : null,
//         option_a: questionType === "MCQ" ? formData.option_a || null : null,
//         option_b: questionType === "MCQ" ? formData.option_b || null : null,
//         option_c: questionType === "MCQ" ? formData.option_c || null : null,
//         option_d: questionType === "MCQ" ? formData.option_d || null : null,
//         option_a_image_url:
//           questionType === "MCQ" ? formData.option_a_image_url || null : null,
//         option_b_image_url:
//           questionType === "MCQ" ? formData.option_b_image_url || null : null,
//         option_c_image_url:
//           questionType === "MCQ" ? formData.option_c_image_url || null : null,
//         option_d_image_url:
//           questionType === "MCQ" ? formData.option_d_image_url || null : null,
//         answer_idx: questionType === "MCQ" ? formData.answer_idx : null,
//       };

//       console.log("Question Data to Send:", questionData);
//       console.log("Exam ID:", exam.id);

//       const response = await apiService.addQuestionToExam(exam.id, questionData);
//       console.log("✅ API Response:", response);
      
//       // Reset form data
//       setFormData({
//         content: "",
//         image_url: "",
//         description: "",
//         option_a: "",
//         option_b: "",
//         option_c: "",
//         option_d: "",
//         option_a_image_url: "",
//         option_b_image_url: "",
//         option_c_image_url: "",
//         option_d_image_url: "",
//         answer_idx: 0,
//       });
      
//       const successConfig = createSuccessModal(
//         "প্রশ্ন যোগ হয়েছে!",
//         "প্রশ্নটি সফলভাবে পরীক্ষায় যোগ করা হয়েছে।",
//         "আপনার প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে।"
//       );
//       console.log("Success Config:", successConfig);
      
//       setModalConfig(successConfig);
//       setShowSuccessModal(true);
      
//       console.log("✓ Success modal should show now");
//       console.log("showSuccessModal state:", true);
//       console.log("modalConfig state:", successConfig);
//     } catch (error) {
//       console.error("❌ Error:", error);
//       const err = error as { message?: string; detail?: string; response?: { data?: unknown } };
//       console.error("Error Details:", err);
      
//       setModalConfig(createErrorModal(
//         "প্রশ্ন যোগ করা যায়নি!",
//         "প্রশ্নটি যোগ করতে সমস্যা হয়েছে।",
//         err.detail || err.message || JSON.stringify(err) || "অনুগ্রহ করে তথ্যগুলো চেক করে আবার চেষ্টা করুন।"
//       ));
//       setShowErrorModal(true);
//     } finally {
//       setIsSubmitting(false);
//       console.log("=== Form Submit Ended ===");
//     }
//   };

//   const handleSuccessModalClose = () => {
//     setShowSuccessModal(false);
//     setModalConfig(null);
//     onSuccess(); // Refresh parent
//     onClose(); // Close the add question modal
//   };

//   const handleErrorModalClose = () => {
//     setShowErrorModal(false);
//     setModalConfig(null);
//   };

//   return (
//     <>
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
//         <div className="bg-white rounded-lg max-w-3xl w-full p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
//           <div className="flex justify-between items-center mb-4 sm:mb-6">
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
//               নতুন প্রশ্ন যোগ করুন
//             </h2>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600 p-1"
//               type="button"
//             >
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Question Type Selection */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 প্রশ্নের ধরন
//               </label>
//               <div className="flex gap-4">
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     value="MCQ"
//                     checked={questionType === "MCQ"}
//                     onChange={(e) =>
//                       setQuestionType(e.target.value as "MCQ" | "WRITTEN")
//                     }
//                     className="mr-2"
//                   />
//                   <span className="text-gray-700">MCQ (বহুনির্বাচনী)</span>
//                 </label>
//                 <label className="flex items-center">
//                   <input
//                     type="radio"
//                     value="WRITTEN"
//                     checked={questionType === "WRITTEN"}
//                     onChange={(e) =>
//                       setQuestionType(e.target.value as "MCQ" | "WRITTEN")
//                     }
//                     className="mr-2"
//                   />
//                   <span className="text-gray-700">Written (লিখিত)</span>
//                 </label>
//               </div>
//             </div>

//             {/* Question Content */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 প্রশ্ন *
//               </label>
//               <textarea
//                 required
//                 value={formData.content}
//                 onChange={(e) =>
//                   setFormData({ ...formData, content: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
//                 rows={3}
//                 placeholder="প্রশ্ন লিখুন"
//               />
//             </div>

//             {/* Question Image - Combined Upload and URL */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 প্রশ্নের ছবি (ঐচ্ছিক)
//               </label>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 {/* File Upload from PC */}
//                 <div>
//                   <label className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
//                     <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                       {uploadingFiles.question ? (
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
//                       ) : (
//                         <>
//                           <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                           </svg>
//                           <p className="text-sm text-gray-500">
//                             <span className="font-semibold">PC থেকে আপলোড</span>
//                           </p>
//                           <p className="text-xs text-gray-400">JPG, PNG (max 5MB)</p>
//                         </>
//                       )}
//                     </div>
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                       onChange={(e) => {
//                         const file = e.target.files?.[0];
//                         if (file) {
//                           console.log("File selected:", file.name);
//                           handleFileUpload(file, "image_url");
//                         }
//                       }}
//                       disabled={uploadingFiles.question}
//                     />
//                   </label>
//                 </div>

//                 {/* ============================================================================
//                     MODIFIED: Google Drive URL Input
//                     Changed to type="text" to accept local paths
//                     ============================================================================ */}
//                 <div>
//                   <input
//                     type="text"
//                     value={formData.image_url}
//                     onChange={(e) =>
//                       handleImageUrlChange(e.target.value, "image_url")
//                     }
//                     className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
//                     placeholder="অথবা Google Drive লিংক পেস্ট করুন"
//                   />
//                 </div>
//                 {/* ============================================================================
//                     END MODIFICATION
//                     ============================================================================ */}
//               </div>

//               <p className="text-xs text-gray-500 mt-1">
//                 💡 PC থেকে আপলোড করুন অথবা Google Drive লিংক পেস্ট করুন
//               </p>

//               {/* ============================================================================
//                   MODIFIED: Image Preview
//                   Uses regular img tag with proper src handling for all image types
//                   ============================================================================ */}
//               {formData.image_url && (
//                 <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
//                   <p className="text-xs text-gray-600 mb-2">প্রিভিউ:</p>
//                   <div className="relative w-full h-48 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
//                     <img
//                       src={formData.image_url}
//                       alt="Question Preview"
//                       className="max-w-full max-h-full object-contain"
//                       onLoad={() => console.log("✅ Image loaded successfully:", formData.image_url)}
//                       onError={(e) => {
//                         const target = e.currentTarget as HTMLImageElement;
//                         console.error("❌ Image failed to load:", formData.image_url);
//                         target.style.display = "none";
//                         target.parentElement!.innerHTML += '<p class="text-red-500 text-sm">ছবি লোড হয়নি</p>';
//                       }}
//                       loading="lazy"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1 break-all">URL: {formData.image_url}</p>
//                 </div>
//               )}
//               {/* ============================================================================
//                   END IMAGE PREVIEW MODIFICATION
//                   ============================================================================ */}
//             </div>

//             {/* Description/Explanation */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 উত্তরের ব্যাখ্যা (ঐচ্ছিক)
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
//                 rows={2}
//                 placeholder="উত্তরের ব্যাখ্যা লিখুন (ফলাফলে দেখানো হবে)"
//               />
//             </div>

//             {/* MCQ Options */}
//             {questionType === "MCQ" && (
//               <div className="space-y-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   অপশনসমূহ (কমপক্ষে ২টি) *
//                 </label>

//                 {["A", "B", "C", "D"].map((letter, index) => (
//                   <div
//                     key={letter}
//                     className="border border-gray-200 rounded-lg p-3 bg-gray-50"
//                   >
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className="font-semibold text-gray-600 w-8">
//                         {letter}.
//                       </span>
//                       <input
//                         type="text"
//                         value={
//                           formData[
//                             `option_${letter.toLowerCase()}` as keyof typeof formData
//                           ]
//                         }
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             [`option_${letter.toLowerCase()}`]: e.target.value,
//                           })
//                         }
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 bg-white"
//                         placeholder={`অপশন ${letter} এর টেক্সট`}
//                       />
//                       <input
//                         type="radio"
//                         name="correct-answer"
//                         checked={formData.answer_idx === index}
//                         onChange={() =>
//                           setFormData({ ...formData, answer_idx: index })
//                         }
//                         className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
//                         title="সঠিক উত্তর"
//                       />
//                     </div>

//                     {/* ============================================================================
//                         MODIFIED: Option Image Upload Section
//                         Changed to type="text" and improved layout
//                         ============================================================================ */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
//                       {/* File Upload */}
//                       <label className="flex flex-col items-center justify-center px-2 py-3 bg-white border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
//                         <div className="flex items-center gap-2">
//                           {uploadingFiles[`option_${letter.toLowerCase()}` as keyof typeof uploadingFiles] ? (
//                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
//                           ) : (
//                             <>
//                               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                               </svg>
//                               <span className="text-xs text-gray-500">PC থেকে আপলোড</span>
//                             </>
//                           )}
//                         </div>
//                         <input
//                           type="file"
//                           className="hidden"
//                           accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                           onChange={(e) => {
//                             const file = e.target.files?.[0];
//                             if (file) {
//                               console.log(`Option ${letter} file selected:`, file.name);
//                               handleFileUpload(file, `option_${letter.toLowerCase()}_image_url` as any);
//                             }
//                           }}
//                           disabled={uploadingFiles[`option_${letter.toLowerCase()}` as keyof typeof uploadingFiles]}
//                         />
//                       </label>

//                       {/* URL Input - Changed to type="text" */}
//                       <input
//                         type="text"
//                         value={
//                           formData[
//                             `option_${letter.toLowerCase()}_image_url` as keyof typeof formData
//                           ]
//                         }
//                         onChange={(e) =>
//                           handleImageUrlChange(
//                             e.target.value,
//                             `option_${letter.toLowerCase()}_image_url`,
//                           )
//                         }
//                         className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs text-gray-700 bg-white"
//                         placeholder="অথবা লিংক পেস্ট করুন"
//                       />
//                     </div>
//                     {/* ============================================================================
//                         END OPTION IMAGE INPUT MODIFICATION
//                         ============================================================================ */}

//                     {/* ============================================================================
//                         MODIFIED: Option Image Preview
//                         Better preview with error handling
//                         ============================================================================ */}
//                     {formData[
//                       `option_${letter.toLowerCase()}_image_url` as keyof typeof formData
//                     ] && (
//                       <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
//                         <p className="text-xs text-gray-600 mb-1">প্রিভিউ:</p>
//                         <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
//                           <img
//                             src={formData[
//                               `option_${letter.toLowerCase()}_image_url` as keyof typeof formData
//                             ] as string}
//                             alt={`Option ${letter} Preview`}
//                             className="max-w-full max-h-full object-contain"
//                             onLoad={() => console.log(`✅ Option ${letter} image loaded`)}
//                             onError={(e) => {
//                               const target = e.currentTarget as HTMLImageElement;
//                               console.error(`❌ Option ${letter} image failed to load`);
//                               target.style.display = "none";
//                               target.parentElement!.innerHTML += '<p class="text-red-500 text-xs">লোড হয়নি</p>';
//                             }}
//                             loading="lazy"
//                           />
//                         </div>
//                       </div>
//                     )}
//                     {/* ============================================================================
//                         END OPTION IMAGE PREVIEW MODIFICATION
//                         ============================================================================ */}
//                   </div>
//                 ))}

//                 <p className="text-xs text-gray-500">
//                   ✓ রেডিও বাটনে ক্লিক করে সঠিক উত্তর নির্বাচন করুন
//                 </p>
//               </div>
//             )}

//             {/* Submit Buttons */}
//             <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 বাতিল করুন
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                     যোগ হচ্ছে...
//                   </>
//                 ) : (
//                   "প্রশ্ন যোগ করুন"
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Success Modal */}
//       {showSuccessModal && modalConfig && (
//         <div className="fixed inset-0 z-[70]">
//           <CustomModal
//             isOpen={showSuccessModal}
//             onClose={handleSuccessModalClose}
//             title={modalConfig.title}
//             message={modalConfig.message}
//             description={modalConfig.description}
//             type="success"
//             buttons={[
//               {
//                 label: 'ঠিক আছে',
//                 onClick: handleSuccessModalClose,
//                 variant: 'primary',
//               },
//             ]}
//           />
//         </div>
//       )}

//       {/* Error Modal */}
//       {showErrorModal && modalConfig && (
//         <div className="fixed inset-0 z-[70]">
//           <CustomModal
//             isOpen={showErrorModal}
//             onClose={handleErrorModalClose}
//             title={modalConfig.title}
//             message={modalConfig.message}
//             description={modalConfig.description}
//             type="error"
//             buttons={[
//               {
//                 label: 'ঠিক আছে',
//                 onClick: handleErrorModalClose,
//                 variant: 'primary',
//               },
//             ]}
//           />
//         </div>
//       )}
//     </>
//   );
// }
