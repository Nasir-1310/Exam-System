'use client';

import { ResultDetailed, Exam } from '@/lib/types';

interface ResultSummaryProps {
  result: ResultDetailed;
  exam: Exam;
}

export default function ResultSummary({
  result,
  exam,
}: ResultSummaryProps) {
  const totalMark = result.mark;
  const totalPossibleMarks = exam.mark; // Total possible marks from the exam
  const correctCount = result.correct_answers;
  const wrongCount = result.incorrect_answers;
  const skippedCount = exam.questions.length - (correctCount + wrongCount); // Assuming skipped are neither correct nor incorrect

  const percentage = ((totalMark / totalPossibleMarks) * 100).toFixed(2);
  const passed = parseFloat(percentage) >= 40; // Assuming 40% is pass mark

  return (
    <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-md p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${
              passed ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {passed ? "Passed" : "Failed"}
          </span>
          <p className="text-sm text-slate-500">Exam Result Snapshot</p>
        </div>
        <div className="text-sm text-slate-600 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            Total {exam.mark} marks
          </span>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight">
        {exam.title}
      </h1>

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-sky-50 to-white p-5">
          <p className="text-sky-700 text-xs font-semibold uppercase tracking-wide mb-2">Score</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-sky-900">{totalMark.toFixed(2)}</p>
            <span className="text-sm text-sky-600">/ {totalPossibleMarks}</span>
          </div>
          <p className="text-sky-700 text-sm mt-1">Marks earned</p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
          <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-2">Percentage</p>
          <p className="text-4xl font-bold text-emerald-900">{percentage}%</p>
          <p className="text-emerald-700 text-sm mt-1">Pass mark: 40%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="text-center p-4 rounded-xl border border-emerald-100 bg-emerald-50/70">
          <p className="text-sm font-semibold text-emerald-800">Correct</p>
          <p className="text-3xl font-bold text-emerald-900 mt-1">{correctCount}</p>
        </div>

        <div className="text-center p-4 rounded-xl border border-rose-100 bg-rose-50/70">
          <p className="text-sm font-semibold text-rose-800">Wrong</p>
          <p className="text-3xl font-bold text-rose-900 mt-1">{wrongCount}</p>
        </div>

        <div className="text-center p-4 rounded-xl border border-slate-200 bg-slate-50">
          <p className="text-sm font-semibold text-slate-800">Skipped</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{skippedCount}</p>
        </div>
      </div>
    </div>
  );
}