// components/exam/ExamCard.tsx
import Link from "next/link";

interface ExamCardProps {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  is_premium: boolean;
  isLoggedIn?: boolean;
}

export default function ExamCard({
  id,
  title,
  description,
  duration_minutes,
  total_marks,
  is_premium,
  isLoggedIn = false,
}: ExamCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
        {is_premium && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
            Premium
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{duration_minutes} mins</span>
        </div>
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>{total_marks} marks</span>
        </div>
      </div>

      {is_premium && !isLoggedIn ? (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed"
        >
          Login Required
        </button>
      ) : (
        <Link
          href={`/exam/mcq/${id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Start Exam
        </Link>
      )}
    </div>
  );
}