// src/components/home/CourseFilters.tsx
'use client';

type CourseCategory = 'all' | 'free' | 'regular-bcs' | 'subjective-bcs' | 'bank' | 'am-club' | 'medical' | 'primary';

interface CourseFiltersProps {
  selectedCategory: CourseCategory;
  onCategoryChange: (category: CourseCategory) => void;
}

// Course category buttons data
const categories = [
  { id: 'all', label: 'সকল কোর্স' },
  { id: 'free', label: 'ফ্রি কোর্স' },
  { id: 'regular-bcs', label: 'রেগুলার বিসিএস কোর্স' },
  { id: 'subjective-bcs', label: 'সাবজেক্টিভ বিসিএস কোর্স' },
  { id: 'bank', label: 'ব্যাংক কোর্স' },
  { id: 'am-club', label: '৬ এএম ক্লাব' },
  { id: 'medical', label: 'মেডিকেল কোর্স' },
  { id: 'primary', label: 'প্রাইমারি ও নন-ক্যাডার' },
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