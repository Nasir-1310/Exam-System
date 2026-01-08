// src/components/courses/Pagination.tsx
'use client';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
}

interface PaginationProps {
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function Pagination({ paginationInfo, onPageChange }: PaginationProps) {
  const { currentPage, totalPages } = paginationInfo;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-12">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
        }`}
      >
        পূর্ববর্তী
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`min-w-[40px] px-4 py-2 rounded-lg font-medium transition-colors ${
            page === currentPage
              ? 'bg-blue-600 text-white shadow-md'
              : page === '...'
              ? 'bg-transparent text-gray-400 cursor-default'
              : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
        }`}
      >
        পরবর্তী
      </button>
    </div>
  );
}