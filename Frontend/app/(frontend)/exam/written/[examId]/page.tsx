"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import Timer from "@/components/exam/Timer";
import apiService from "@/lib/api";
import { convertGoogleDriveUrl } from "@/lib/googleDriveUtils";
import MathContentRenderer from "@/components/editor/MathContentRenderer";

interface WrittenQuestion {
  id: number;
  q_type: "WRITTEN" | "MCQ";
  content: string;
  image_url?: string;
  second_image_url?: string;
}

interface WrittenExam {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  is_active: boolean;
  is_mcq?: boolean;
  questions: WrittenQuestion[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function WrittenExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const examId = parseInt(params.examId as string, 10);

  const [exam, setExam] = useState<WrittenExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [manualPdfLink, setManualPdfLink] = useState("");

  useEffect(() => {
    const loadExam = async () => {
      try {
        setLoading(true);
        const data = await apiService.getExamById(examId);

        if (!data?.is_active) {
          Swal.fire({ icon: "error", title: "পরীক্ষা সক্রিয় নয়" });
          router.push("/exam");
          return;
        }

        if (data?.is_mcq !== false) {
          Swal.fire({ icon: "error", title: "এটি লিখিত পরীক্ষা নয়" });
          router.push("/exam");
          return;
        }

        setExam(data);
      } catch (error: unknown) {
        const err = error as { message?: string };
        Swal.fire({
          icon: "error",
          title: "ত্রুটি",
          text: err?.message || "পরীক্ষা লোড করা যায়নি",
        });
        router.push("/exam");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(examId)) {
      loadExam();
    }
  }, [examId, router]);

  const getImageSrc = (imageUrl: string): string => {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      if (imageUrl.includes("drive.google.com")) {
        return convertGoogleDriveUrl(imageUrl);
      }
      return imageUrl;
    }

    if (imageUrl.startsWith("/uploads/")) {
      return `${API_BASE}${imageUrl}`;
    }

    if (imageUrl.includes("drive.google.com")) {
      return convertGoogleDriveUrl(`https://${imageUrl}`);
    }

    return imageUrl;
  };

  const handleAnswerFileUpload = async (file: File) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) {
      Swal.fire({ icon: "warning", title: "শুধু PDF বা ছবি আপলোড করুন" });
      return;
    }

    try {
      setUploadingFile(true);
      const url = await apiService.uploadWrittenAnswerFile(file);
      setUploadedFileUrl(url);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Swal.fire({
        icon: "error",
        title: "আপলোড ব্যর্থ",
        text: err?.message || "ফাইল আপলোড করা যায়নি",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const submitWrittenExam = async (autoSubmit = false) => {
    if (!exam || exam.questions.length === 0) return;

    const question = exam.questions[0];
    const fileLink = manualPdfLink.trim() || uploadedFileUrl;

    if (!fileLink) {
      Swal.fire({
        icon: "warning",
        title: "উত্তর ফাইল প্রয়োজন",
        text: "PDF বা ছবি আপলোড করুন, অথবা ফাইল লিংক দিন।",
      });
      return;
    }

    if (!autoSubmit) {
      const confirm = await Swal.fire({
        title: "পরীক্ষা জমা দেবেন?",
        text: "জমা দেওয়ার পরে আর পরিবর্তন করা যাবে না।",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "হ্যাঁ, জমা দিন",
        cancelButtonText: "বাতিল",
      });

      if (!confirm.isConfirmed) return;
    }

    try {
      setSubmitting(true);
      await apiService.submitExam(exam.id, [
        {
          question_id: question.id,
          uploaded_file: fileLink,
        },
      ]);

      await Swal.fire({
        icon: "success",
        title: "সফল",
        text: "লিখিত পরীক্ষা সফলভাবে জমা হয়েছে",
      });
      router.push(`/exam/written/result/${exam.id}`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Swal.fire({
        icon: "error",
        title: "জমা ব্যর্থ",
        text: err?.message || "পরীক্ষা জমা করা যায়নি",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!exam || exam.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">প্রশ্ন পাওয়া যায়নি</p>
      </div>
    );
  }

  const question = exam.questions[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-6 sticky top-16 z-40">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-sm text-gray-600">লিখিত পরীক্ষা (১টি প্রশ্ন)</p>
            </div>
            <Timer duration={exam.duration_minutes * 60} onTimeUp={() => submitWrittenExam(true)} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">প্রশ্ন</h2>
            <div className="text-gray-800 leading-relaxed">
              <MathContentRenderer content={question.content} />
            </div>
          </div>

          {(question.image_url || question.second_image_url) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.image_url && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <Image
                    src={getImageSrc(question.image_url)}
                    alt="Question image 1"
                    width={1200}
                    height={800}
                    className="w-full max-h-80 object-contain rounded"
                    unoptimized
                  />
                </div>
              )}
              {question.second_image_url && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <Image
                    src={getImageSrc(question.second_image_url)}
                    alt="Question image 2"
                    width={1200}
                    height={800}
                    className="w-full max-h-80 object-contain rounded"
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">আপনার উত্তর জমা দিন</h3>

            <div>
              <label className="block text-sm text-gray-700 mb-2">ফাইল আপলোড (PDF বা ছবি)</label>
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAnswerFileUpload(file);
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {uploadingFile && <p className="text-sm text-blue-600 mt-2">ফাইল আপলোড হচ্ছে...</p>}
              {uploadedFileUrl && (
                <p className="text-sm text-green-600 mt-2 break-all">আপলোড হয়েছে: {uploadedFileUrl}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">অথবা PDF/ছবির লিংক দিন</label>
              <input
                type="url"
                value={manualPdfLink}
                onChange={(e) => setManualPdfLink(e.target.value)}
                placeholder="https://.../answer.pdf অথবা .jpg/.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <button
              onClick={() => submitWrittenExam(false)}
              disabled={submitting || uploadingFile}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? "জমা হচ্ছে..." : "পরীক্ষা জমা দিন"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
