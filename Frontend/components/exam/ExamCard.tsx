import Link from "next/link";
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
  const { id, title, description, duration_minutes, mark, is_premium, is_active, start_time, thumbnail_url, course_id, is_free, price } = exam;

  const isFree = Boolean(is_free || !course_id);
  const isPremium = Boolean(!isFree && (is_premium || Number(price ?? 0) > 0));
  const canTakeExam = isLoggedIn && (isFree || isEnrolled) && is_active && new Date(start_time) <= new Date();

  let disabledMessage = "";
  if (!isLoggedIn) {
    disabledMessage = "Login Required";
  } else if (!isFree && !isEnrolled) {
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
    const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240" fill="none"><rect width="400" height="240" rx="12" fill="#0f172a"/><path d="M80 160L140 110L200 150L260 100L320 140V180H80V160Z" fill="#1d4ed8" opacity="0.35"/><rect x="110" y="70" width="180" height="16" rx="8" fill="#22c55e" opacity="0.6"/><rect x="110" y="100" width="120" height="12" rx="6" fill="#e5e7eb" opacity="0.8"/><text x="200" y="200" fill="#e5e7eb" font-size="16" font-family="Arial" font-weight="600" text-anchor="middle">No thumbnail</text></svg>'
    )}`;

    const fallback = (
      <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-slate-900 flex items-center justify-center">
        <img src={placeholderSvg} alt="Placeholder" className="w-full h-full object-cover" />
      </div>
    );

    if (!thumbnail_url) return fallback;

    const commonImgProps = {
      alt: title,
      className: 'w-full h-full object-cover',
      loading: 'lazy' as const,
      onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget as HTMLImageElement;
        target.src = placeholderSvg;
      },
    };

    const isLocal = thumbnail_url.startsWith('/exams/') || thumbnail_url.startsWith('/uploads/');
    const isDrive = thumbnail_url.includes('drive.google.com');
    const src = isLocal ? thumbnail_url : isDrive ? convertGoogleDriveUrl(thumbnail_url) : thumbnail_url;

    return (
      <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-slate-900">
        <img src={src} {...commonImgProps} />
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
          {isFree ? (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0">
              Free
            </span>
          ) : (
            isPremium && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0">
                Premium
              </span>
            )
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