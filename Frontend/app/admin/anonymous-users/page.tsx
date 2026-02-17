'use client';

import { useEffect, useState } from 'react';
import apiService from '@/lib/api';

interface AnonymousUser {
  id: number;
  name: string;
  email?: string;
  role?: string;
  active_mobile?: string;
  created_at?: string;
}

export default function AnonymousUsersPage() {
  const [users, setUsers] = useState<AnonymousUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAnonymousUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load anonymous users:', err);
        setError('ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDelete = async (userId: number) => {
    const ok = window.confirm('ব্যবহারকারী মুছে ফেলবেন?');
    if (!ok) return;
    try {
      await apiService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setMessage('ব্যবহারকারী মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      setError(err?.message || 'মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white border border-red-100 rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-red-700 mb-2">ত্রুটি</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  const showMessage = message && (
    <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-800 border border-green-100">
      {message}
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">অ্যানোনিমাস ব্যবহারকারী</h1>
        <p className="text-gray-600">অ্যানোনিমাস অংশগ্রহণকারীদের তালিকা</p>
      </div>

      {showMessage}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">মোট অ্যানোনিমাস ব্যবহারকারী</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-xl">
              <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a6 6 0 00-9-5.197M17 20H7m10 0v-2a6 6 0 00-9-5.197M7 20H2v-2a6 6 0 019-5.197M7 20v-2a6 6 0 019-5.197M12 12a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">সকল অ্যানোনিমাস ব্যবহারকারী</h2>
            <p className="text-sm text-gray-500">পরীক্ষা দিয়েছেন বা রেজিস্টার করেছেন এমন অ্যানোনিমাস অংশগ্রহণকারী</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">নাম</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ইমেইল</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মোবাইল</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">যোগ হওয়ার তারিখ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">কাজ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    কোনো অ্যানোনিমাস ব্যবহারকারী পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {(user.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Anonymous'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.active_mobile || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      <button onClick={() => handleDelete(user.id)} className="hover:text-red-800 font-medium">
                        মুছে ফেলুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
