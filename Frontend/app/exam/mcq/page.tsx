// app/exam/mcq/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { mockExams } from "@/lib/mockExamData";
import ExamCard from "@/components/exam/ExamCard";

export default function MCQExamListPage() {
  const [isLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/exam"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Exam Types
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">MCQ Exams</h1>
            <p className="text-gray-600 mt-2">
              Choose an MCQ exam to start practicing
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {mockExams.map((exam) => (
            <div key={exam.id}>
              <ExamCard
                id={exam.id}
                title={exam.title}
                description={exam.description}
                duration_minutes={exam.duration_minutes}
                total_marks={exam.total_marks}
                is_premium={exam.is_premium}
                isLoggedIn={isLoggedIn}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}