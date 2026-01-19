import Link from "next/link";
import Image from "next/image";
import { Exam } from '@/lib/types';
import { convertGoogleDriveUrl } from '@/lib/googleDriveUtils';
import MathContentRenderer from '@/components/editor/MathContentRenderer'; // ADD THIS IMPORT

interface ExamCardProps {
  exam: Exam;
  isEnrolled: boolean;
}

export default function ExamCard({
  exam,
  isEnrolled = false,
}: ExamCardProps) {
  const isLoggedIn = typeof window !== 'undefined' && (localStorage.getItem('token') || document.cookie.includes('token'));
  const { id, title, description, duration_minutes, mark, is_premium, is_active, start_time, thumbnail_url } = exam;

  const canTakeExam = isLoggedIn && isEnrolled && is_active && new Date(start_time) <= new Date();

  let disabledMessage = "";
  if (!isLoggedIn) {
    disabledMessage = "Login Required";
  } else if (!isEnrolled) {
    disabledMessage = "Enroll in Course to Take Exam";
  } else if (!is_active) {
    disabledMessage = "Exam Not Yet Active";
  } else if (new Date(start_time) > new Date()) {
    disabledMessage = `Exam starts on ${new Date(start_time).toLocaleString()}`;
  }

  // ============================================================================
  // ADDED FOR: Exam Thumbnail Image Support
  // Helper function to render exam thumbnail (local or Google Drive)
  // ============================================================================
  const renderThumbnail = () => {
    if (!thumbnail_url) return null;

    // Check if it's a local uploaded image
    if (thumbnail_url.startsWith('/exams/') || thumbnail_url.startsWith('/uploads/')) {
      return (
        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={thumbnail_url}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              console.warn('Local exam thumbnail failed to load:', thumbnail_url);
            }}
            loading="lazy"
          />
        </div>
      );
    }

    // Check if it's a Google Drive URL
    if (thumbnail_url.includes('drive.google.com')) {
      return (
        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={convertGoogleDriveUrl(thumbnail_url)}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              console.warn('Google Drive exam thumbnail failed to load:', thumbnail_url);
            }}
            loading="lazy"
          />
        </div>
      );
    }

    // For other external URLs
    return (
      <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={thumbnail_url}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            console.warn('External exam thumbnail failed to load:', thumbnail_url);
          }}
          loading="lazy"
        />
      </div>
    );
  };
  // ============================================================================
  // END THUMBNAIL RENDERING HELPER
  // ============================================================================

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* ============================================================================
          ADDED FOR: Exam Thumbnail Display
          ============================================================================ */}
      {renderThumbnail()}
      {/* ============================================================================
          END THUMBNAIL DISPLAY
          ============================================================================ */}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {/* UPDATED: Use MathContentRenderer for exam description */}
            <MathContentRenderer 
              content={description}
              className="text-gray-600 text-sm mt-1"
            />
          </div>
          {is_premium && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0">
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
            <span>{mark} marks</span>
          </div>
        </div>

        {!canTakeExam ? (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed"
          >
            {disabledMessage}
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
    </div>
  );
}