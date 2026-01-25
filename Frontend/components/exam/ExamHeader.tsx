// Frontend/components/exam/ExamHeader.tsx
'use client';

import React from 'react';
import Timer, { TimerRef } from './Timer';

interface ExamHeaderProps {
  duration: number;
  onTimeUp: () => void;
  timerRef: React.RefObject<TimerRef>;
  isExpired: boolean;
}

export default function ExamHeader({
  duration,
  onTimeUp,
  timerRef,
  isExpired,
}: ExamHeaderProps) {
  return (
    <div className={`fixed top-15 lg:top-20 left-0 right-0 z-10 ${isExpired ? 'bg-red-600' : 'bg-white'} text-white `}>
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm hidden sm:block text-blue-900 ">
            {isExpired ? 'সময় শেষ!' : 'বাকি সময়'}
          </span>
        </div>
        <Timer duration={duration} onTimeUp={onTimeUp} ref={timerRef} isMobile />
      </div>
    </div>
  );
}