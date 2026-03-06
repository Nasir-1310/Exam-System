"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import apiService from "@/lib/api";
import type { ResultDetailed } from "@/lib/types";

const isImageFileUrl = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

interface WrittenResultResponse extends ResultDetailed {
  exam?: {
    id: number;
    title: string;
    mark?: number;
  };
}

export default function WrittenExamResultPage() {
  const params = useParams();
  const examId = parseInt(params.examId as string, 10);

  const [result, setResult] = useState<WrittenResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      if (Number.isNaN(examId)) {
        setError("অবৈধ পরীক্ষার আইডি");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (token) {
          const data = await apiService.getDetailedExamResult(examId);
          setResult(data as WrittenResultResponse);
          return;
        }

        const anonymousRaw = typeof window !== "undefined" ? localStorage.getItem("anonymous_user") : null;
        if (anonymousRaw) {
          const anonymousData = JSON.parse(anonymousRaw) as { email?: string };
          if (anonymousData?.email) {
            const data = await apiService.getDetailedExamResultAnonymous(examId, anonymousData.email);
            setResult(data as WrittenResultResponse);
            return;
          }
        }

        setError("ফলাফল দেখতে লগইন করুন অথবা সঠিক ইমেইল দিয়ে সাবমিট করুন।");
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message || "ফলাফল লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [examId]);

  const submittedFiles = useMemo(() => {
    if (!result?.answers_details) return [] as string[];
    return result.answers_details
      .map((a) => a.uploaded_file)
      .filter((url): url is string => Boolean(url));
  }, [result]);

  const isPending = useMemo(() => {
    if (!result?.answers_details?.length) return true;
    return !result.answers_details.some((a) => {
      const marks = Number(a.marks_obtained || 0);
      return marks > 0 || a.is_correct !== null;
    });
  }, [result]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <p className="text-gray-600">সাবমিশন লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error || !result?.exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 px-4">
        <div className="bg-white rounded-lg shadow p-6 text-center max-w-xl w-full">
          <p className="text-red-600 font-medium mb-4">{error || "ফলাফল পাওয়া যায়নি"}</p>
          <Link href="/exam" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            পরীক্ষায় ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  const exam = result.exam;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pt-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">উত্তর জমা হয়েছে</h1>
            <p className="text-gray-600 mb-4">
              {isPending ? "আপনার উত্তর মূল্যায়নের জন্য অপেক্ষমাণ আছে।" : "আপনার ফলাফল প্রকাশিত হয়েছে।"}
            </p>
            <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium">
              {isPending ? "স্ট্যাটাস: মূল্যায়ন চলছে" : "স্ট্যাটাস: প্রকাশিত"}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              ফলাফল প্রকাশ হলে আপনার ইমেইলে পাঠানো হবে। অনুগ্রহ করে ইমেইল একবার চেক করবেন।
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">পরীক্ষার সংক্ষিপ্ত তথ্য</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">পরীক্ষার নাম:</span> {exam.title}
            </p>
            <p>
              <span className="font-medium">মোট নম্বর:</span> {exam.mark}
            </p>
            <p>
              <span className="font-medium">জমা দেওয়ার সময়:</span> {new Date(result.submission_time).toLocaleString("bn-BD")}
            </p>
            <p>
              <span className="font-medium">প্রচেষ্টা নম্বর:</span> {result.attempt_number}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">জমা দেওয়া ফাইল</h2>
          {submittedFiles.length === 0 ? (
            <p className="text-gray-500">কোনো ফাইল পাওয়া যায়নি।</p>
          ) : (
            <div className="space-y-4">
              {submittedFiles.map((fileUrl, index) => (
                <div key={`${fileUrl}-${index}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-700 mb-3 break-all">ফাইল {index + 1}: {fileUrl}</p>
                  {isImageFileUrl(fileUrl) && (
                    <Image
                      src={fileUrl}
                      alt={`Submission ${index + 1}`}
                      width={1200}
                      height={800}
                      className="w-full max-h-80 object-contain rounded bg-white mb-3"
                      unoptimized
                    />
                  )}
                  <div className="flex gap-3">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      খুলুন
                    </a>
                    <a
                      href={fileUrl}
                      download
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium text-gray-700"
                    >
                      ডাউনলোড
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/exam" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
            সব পরীক্ষায় ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
