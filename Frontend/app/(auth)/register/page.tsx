// Frontend/app/(auth)/register/page.tsx - ALL ISSUES FIXED
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiService from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    active_mobile: '',
    whatsapp: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      setLoading(false);
      return;
    }

    // Validate mobile number
    if (formData.active_mobile.length < 11) {
      setError('মোবাইল নম্বর কমপক্ষে ১১ ডিজিটের হতে হবে');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, whatsapp, ...registerData } = formData;
      
      const finalData = whatsapp 
        ? { ...registerData, whatsapp }
        : registerData;

      await apiService.register(finalData);
      
      setSuccess('রেজিস্ট্রেশন সফল হয়েছে! রিডাইরেক্ট করা হচ্ছে...');
      
      // Wait 1 second to show success message
      setTimeout(() => {
        router.push('/exam');
        router.refresh();
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            BCS Exam System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                ❌ {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                ✅ {success}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                নাম <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-colors bg-white text-gray-900 placeholder-gray-400"
                placeholder="আপনার পূর্ণ নাম"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                ইমেইল <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-colors bg-white text-gray-900 placeholder-gray-400"
                placeholder="example@email.com"
              />
            </div>

            {/* Mobile Fields - 2 Column on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Active Mobile */}
              <div>
                <label htmlFor="active_mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </label>
                <input
                  id="active_mobile"
                  name="active_mobile"
                  type="tel"
                  required
                  value={formData.active_mobile}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-colors bg-white text-gray-900 placeholder-gray-400"
                  placeholder="01XXXXXXXXX"
                  minLength={11}
                  maxLength={20}
                />
              </div>

              {/* WhatsApp (Optional) */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  হোয়াটসঅ্যাপ <span className="text-gray-400 text-xs">(ঐচ্ছিক)</span>
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-colors bg-white text-gray-900 placeholder-gray-400"
                  placeholder="01XXXXXXXXX"
                  maxLength={20}
                />
              </div>
            </div>

            {/* Password Fields - 2 Column on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  পাসওয়ার্ড <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-colors bg-white text-gray-900 placeholder-gray-400"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  minLength={6}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  নিশ্চিত করুন <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-colors bg-white text-gray-900 placeholder-gray-400"
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading || success ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {success ? 'সফল হয়েছে...' : 'রেজিস্ট্রেশন হচ্ছে...'}
                  </span>
                ) : (
                  'রেজিস্ট্রেশন করুন'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm pt-2">
              <span className="text-gray-600">ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                লগইন করুন
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2026 BCS Exam System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}