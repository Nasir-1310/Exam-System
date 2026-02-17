// src/components/home/CourseFilters.tsx
'use client';

export type CourseCategory = 'all' | 'bcs' | 'bank' | 'primary' | 'free';

interface CourseFiltersProps {
  selectedCategory: CourseCategory;
  onCategoryChange: (category: CourseCategory) => void;
}

// Course category buttons data (aligned with /courses page filters)
const categories: { id: CourseCategory; label: string }[] = [
  { id: 'all', label: 'সকল কোর্স' },
  { id: 'bcs', label: 'বিসিএস কোর্স' },
  { id: 'bank', label: 'ব্যাংক কোর্স' },
  { id: 'primary', label: 'প্রাইমারি কোর্স' },
  { id: 'free', label: 'ফ্রি কোর্স' },
];

export default function CourseFilters({ selectedCategory, onCategoryChange }: CourseFiltersProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id as CourseCategory)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}