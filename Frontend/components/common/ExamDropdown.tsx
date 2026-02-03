// Frontend/components/common/ExamDropdown.tsx
'use client';

import { useEffect, useState } from 'react';
import apiService from '@/lib/api';

interface ExamItem {
  id: number;
  title: string;
}

interface Props {
  value?: string;
  onChange: (val: string) => void;
  className?: string;
}

export default function ExamDropdown({ value = '', onChange, className = '' }: Props) {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAllExams();
        if (!mounted) return;
        // Normalize: expect array of { id, title }
        setExams(Array.isArray(data) ? data : data.exams || []);
      } catch (err: unknown) {
        setError((err as Error)?.message || 'Failed to load exams');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-800 mb-2">পরীক্ষা দ্বারা ফিল্টার করুন</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      >
        <option value="">সব পরীক্ষা</option>
        {loading && <option disabled>লোড হচ্ছে...</option>}
        {!loading && error && <option disabled>{error}</option>}
        {!loading && !error && exams.map((ex) => (
          <option key={ex.id} value={ex.id}>{ex.title}</option>
        ))}
      </select>
    </div>
  );
}
