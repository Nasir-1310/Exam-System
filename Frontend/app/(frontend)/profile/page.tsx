"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiService from "@/lib/api";
import Button from "@/components/ui/Button";

interface ProfileUser {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.ensureAuthCookies();
    const cookieDump = typeof document !== "undefined" ? document.cookie : "";
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    console.log("[profile] cookies:", cookieDump);
    console.log("[profile] localStorage token:", storedToken);

    const currentUser = apiService.getCurrentUser();
    console.log("[profile] currentUser:", currentUser);
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">প্রোফাইল দেখা যায়নি</h1>
          <p className="text-gray-600 mb-6">প্রোফাইল দেখতে লগইন করুন।</p>
          <div className="flex gap-3 justify-center">
            <Button href="/login" variant="primary">
              লগইন
            </Button>
            <Button href="/register" variant="secondary">
              রেজিস্টার
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                ভূমিকা: {user.role}
              </span>
            </div>
            <div className="flex gap-2">
              {/* <Button
                variant="secondary"
                onClick={() => router.push("/my-courses")}
              >
                আমার কোর্স
              </Button> */}
              <Button
                variant="primary"
                onClick={() => router.push("/exam")}
              >
                পরীক্ষা দিন
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">দ্রুত লিঙ্ক</h2>
            <div className="space-y-2">
              <Link href="/my-courses" className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                <p className="font-medium text-gray-900">আমার কোর্স</p>
                <p className="text-sm text-gray-600">কোন কোন কোর্সে ভর্তি হয়েছেন দেখুন</p>
              </Link>
              <Link href="/exam" className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                <p className="font-medium text-gray-900">পরীক্ষা সমূহ</p>
                <p className="text-sm text-gray-600">আপনার জন্য থাকা পরীক্ষা দেখুন ও দিন</p>
              </Link>
              <Link href="/results" className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                <p className="font-medium text-gray-900">রেজাল্ট</p>
                <p className="text-sm text-gray-600">পরীক্ষার ফলাফল ও বিস্তারিত দেখুন</p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">অ্যাকাউন্ট</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>নাম</span>
                <span className="font-semibold text-gray-900">{user.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ইমেইল</span>
                <span className="font-semibold text-gray-900">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ভূমিকা</span>
                <span className="font-semibold text-gray-900">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
