'use client';

import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface TimerProps {
  duration: number; // Duration in seconds
  onTimeUp: () => void;
}

export interface TimerRef {
  start: () => void;
  stop: () => void;
  reset: () => void;
}

const Timer = forwardRef<TimerRef, TimerProps>(({ duration, onTimeUp }, ref) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onTimeUp();
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
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  return (
    <div className="text-right">
      <div className={`text-2xl font-bold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </div>
      <p className="text-xs text-gray-500 mb-2">Time Remaining</p>
      
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
