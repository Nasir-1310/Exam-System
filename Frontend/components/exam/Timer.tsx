// Frontend/components/exam/Timer.tsx
'use client';

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface TimerProps {
  duration: number; // Duration in seconds
  onTimeUp: () => void;
  isMobile?: boolean;
}

export interface TimerRef {
  start: () => void;
  stop: () => void;
  reset: () => void;
  getTimeLeft: () => number;
}

const Timer = forwardRef<TimerRef, TimerProps>(({ duration, onTimeUp, isMobile = false }, ref) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, isRunning, onTimeUp]);

  useImperativeHandle(ref, () => ({
    start: () => setIsRunning(true),
    stop: () => setIsRunning(false),
    reset: () => {
      setIsRunning(false);
      setTimeLeft(duration);
    },
    getTimeLeft: () => timeLeft,
  }));

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timeLeft < 60) return "text-red-600";
    if (timeLeft < 300) return "text-orange-600";
    return "text-blue-600";
  };

  const getProgressColor = () => {
    const percentage = (timeLeft / duration) * 100;
    if (percentage < 10) return "bg-red-500";
    if (percentage < 30) return "bg-orange-500";
    return "bg-blue-500";
  };

  const progressPercentage = (timeLeft / duration) * 100;

  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-lg font-bold ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
    );
  }

  return (
    <div className="text-right">
      <div className={`text-2xl font-bold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </div>
      <p className="text-xs text-gray-500 mb-2">বাকি সময়</p>
      
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden ml-auto">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-1000`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
});

Timer.displayName = 'Timer';

export default Timer;