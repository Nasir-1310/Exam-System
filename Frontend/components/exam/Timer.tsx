// components/exam/Timer.tsx
"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
}

export default function Timer({ initialSeconds, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

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
    const percentage = (timeLeft / initialSeconds) * 100;
    if (percentage < 10) return "bg-red-500";
    if (percentage < 30) return "bg-orange-500";
    return "bg-blue-500";
  };

  const progressPercentage = (timeLeft / initialSeconds) * 100;

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
}