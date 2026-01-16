// components/exam/ResultSummary.tsx
interface ResultSummaryProps {
  totalMark: string;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  skipped: number;
  examTitle: string;
}

export default function ResultSummary({
  totalMark,
  totalMarks,
  correctCount,
  wrongCount,
  skipped,
  examTitle,
}: ResultSummaryProps) {
  const percentage = ((parseFloat(totalMark) / totalMarks) * 100).toFixed(2);
  const passed = parseFloat(percentage) >= 40;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div
          className={`inline-block px-6 py-2 rounded-full text-lg font-bold mb-4 ${
            passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {passed ? "PASSED ✓" : "FAILED ✗"}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{examTitle}</h1>
        <p className="text-gray-600">Exam Result</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <p className="text-blue-600 text-sm font-medium mb-2">Total Score</p>
          <p className="text-4xl font-bold text-blue-900">{totalMark}</p>
          <p className="text-blue-700 text-sm mt-1">out of {totalMarks} marks</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <p className="text-purple-600 text-sm font-medium mb-2">Percentage</p>
          <p className="text-4xl font-bold text-purple-900">{percentage}%</p>
          <p className="text-purple-700 text-sm mt-1">Pass mark: 40%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-600">{correctCount}</p>
          <p className="text-sm text-gray-600 mt-1">Correct</p>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-red-600">{wrongCount}</p>
          <p className="text-sm text-gray-600 mt-1">Wrong</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-600">{skipped}</p>
          <p className="text-sm text-gray-600 mt-1">Skipped</p>
        </div>
      </div>
    </div>
  );
}