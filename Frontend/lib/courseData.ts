import { Course } from "./types";
import apiService from "./api";

export const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "51 BCS Preli + Written Combo Early Bird Batch",
    titleBangla: "প্রিলিমিনারি কম্বো রিটেন লাইভ ব্যাচ",
    category: "regular-bcs",
    price: 15990,
    thumbnail: "/images/courses/bcs-combo.jpg",
    duration: "৬ মাস",
    lectures: 120,
    students: 5430,
    instructor: "Multiple Instructors",
    features: [
      "প্রিলিমিনারি পরীক্ষার পূর্ণ প্রস্তুতি",
      "রিটেন পরীক্ষার সম্পূর্ণ গাইডলাইন",
      "মডেল টেস্ট ও সমাধান",
      "লাইভ ক্লাস এবং রেকর্ডেড ভিডিও",
    ],
    description:
      "৫১তম বিসিএস পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি। প্রিলিমিনারি এবং রিটেন উভয় পর্যায়ের জন্য বিশেষজ্ঞ শিক্ষকদের দ্বারা পরিচালিত।",
    syllabus: [
      {
        id: "s1",
        title: "সেশন প্ল্যান",
        topics: ["প্রতি সপ্তাহে ৫টি ক্লাস", "প্রতিটি ক্লাস ২ ঘন্টা"],
      },
    ],
    isFeatured: true,
    isEarlyBird: true,
  },
  {
    id: "2",
    title: "51 BCS Preli Early Bird Batch",
    titleBangla: "প্রিলি লাইভ ব্যাচ",
    category: "regular-bcs",
    price: 11990,
    thumbnail: "/images/courses/bcs-preli.jpg",
    duration: "৪ মাস",
    lectures: 80,
    students: 3200,
    instructor: "Expert Faculty",
    features: [
      "প্রিলিমিনারি পরীক্ষার সম্পূর্ণ প্রস্তুতি",
      "সাপ্তাহিক মডেল টেস্ট",
      "পূর্ববর্তী বছরের প্রশ্ন সমাধান",
    ],
    description:
      "বিসিএস প্রিলিমিনারি পরীক্ষার জন্য বিশেষভাবে ডিজাইন করা কোর্স।",
    syllabus: [],
    isEarlyBird: true,
  },
    {
    id: "3",
    title: "51 BCS Written Early Bird Batch",
    titleBangla: "রিটেন আর্লি বার্ড ব্যাচ",
    category: "subjective-bcs",
    price: 5990,
    thumbnail: "/images/courses/bcs-written.jpg",
    duration: "৩ মাস",
    lectures: 60,
    students: 2100,
    instructor: "Senior Educators",
    features: [
      "রিটেন পরীক্ষার কৌশল",
      "উত্তর লেখার টেকনিক",
      "প্রতিটি বিষয়ের বিস্তারিত আলোচনা",
    ],
    description: "বিসিএস রিটেন পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি কোর্স।",
    syllabus: [],
  },
    {
    id: "4",
    title: "50 BCS Model Test Batch",
    titleBangla: "মডেল টেস্ট ব্যাচ",
    category: "regular-bcs",
    price: 3990,
    thumbnail: "/images/courses/model-test.jpg",
    duration: "২ মাস",
    lectures: 40,
    students: 4500,
    instructor: "Test Experts",
    features: [
      "৫০টি মডেল টেস্ট",
      "বিস্তারিত সমাধান ও ব্যাখ্যা",
      "পারফরম্যান্স ট্র্যাকিং",
    ],
    description: "বিসিএস পরীক্ষার প্রস্তুতির জন্য বিশেষ মডেল টেস্ট ব্যাচ।",
    syllabus: [],
  },

];

// Helper function to get course by ID
export const getCourseById = (id: string): Course | undefined => {
  // In a real application, fetch from API
  return MOCK_COURSES.find((course) => course.id === id);
};

// Get courses filtered by category. Now fetches from API.
export const getCoursesByCategory = async (category?: string): Promise<Course[]> => {
  try {
    const allCourses = await apiService.getAllCourses();
    if (!category || category === "all") {
      return allCourses;
    } else {
      // Frontend filtering by category, if needed
      return allCourses.filter((course: any) => course.category === category);
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

// Return paginated courses, optionally filtered by category.
export const getPaginatedCourses = async (
  page = 1,
  pageSize = 10,
  category?: string
): Promise<{ courses: Course[]; total: number; totalPages: number; page: number }> => {
  const allCourses = await getCoursesByCategory(category);
  const total = allCourses.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const courses = allCourses.slice(start, end);
  return { courses, total, totalPages, page: currentPage };
};
