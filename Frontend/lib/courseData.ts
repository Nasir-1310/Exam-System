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
    {
    id: "5",
    title: "Bank Job Preli + Written Course 2024",
    titleBangla: "প্রিলি + রিটেন কোর্স ২০২৪",
    category: "bank",
    price: 8990,
    thumbnail: "/images/courses/bank-job.jpg",
    duration: "৪ মাস",
    lectures: 90,
    students: 3800,
    instructor: "Banking Experts",
    features: [
      "ব্যাংক পরীক্ষার সম্পূর্ণ প্রস্তুতি",
      "ম্যাথ ও ইংরেজিতে বিশেষ ফোকাস",
      "ব্যাংকিং বিষয়ক জ্ঞান",
    ],
    description:
      "সরকারি ও বেসরকারি ব্যাংকের চাকরির পরীক্ষার জন্য সম্পূর্ণ কোর্স।",
    syllabus: [],
  },
    {
    id: "6",
    title: "6 AM Club - Productivity Course",
    titleBangla: "প্রোডাক্টিভিটি কোর্স",
    category: "am-club",
    price: 2990,
    thumbnail: "/images/courses/6am-club.jpg",
    duration: "১ মাস",
    lectures: 20,
    students: 6200,
    instructor: "Life Coach",
    features: [
      "প্রতিদিন সকাল ৬টায় লাইভ সেশন",
      "প্রোডাক্টিভিটি টিপস",
      "স্টাডি রুটিন প্ল্যানিং",
    ],
    description: "পড়াশোনার প্রোডাক্টিভিটি বৃদ্ধির জন্য বিশেষ কোর্স।",
    syllabus: [],
  },
    {
    id: "7",
    title: "Medical Admission Course 2024",
    titleBangla: "মেডিকেল ভর্তি কোর্স ২০২৪",
    category: "medical",
    price: 12990,
    thumbnail: "/images/courses/medical.jpg",
    duration: "৬ মাস",
    lectures: 150,
    students: 2800,
    instructor: "Medical Educators",
    features: [
      "পদার্থ, রসায়ন, জীববিজ্ঞান",
      "মডেল টেস্ট ও সমাধান",
      "পূর্ববর্তী বছরের প্রশ্ন",
    ],
    description: "মেডিকেল কলেজে ভর্তির জন্য সম্পূর্ণ প্রস্তুতি কোর্স।",
    syllabus: [],
  },
    {
    id: "8",
    title: "Primary Assistant Teacher Course",
    titleBangla: "প্রাইমারি সহকারী শিক্ষক কোর্স",
    category: "primary",
    price: 6990,
    thumbnail: "/images/courses/primary.jpg",
    duration: "৩ মাস",
    lectures: 70,
    students: 4100,
    instructor: "Primary Experts",
    features: [
      "প্রাইমারি পরীক্ষার সিলেবাস",
      "বাংলা ও ইংরেজি ব্যাকরণ",
      "গণিত ও সাধারণ জ্ঞান",
    ],
    description: "প্রাইমারি সহকারী শিক্ষক নিয়োগ পরীক্ষার প্রস্তুতি।",
    syllabus: [],
  },
    {
    id: "9",
    title: "Free BCS Preparation Basics",
    titleBangla: "ফ্রি বিসিএস প্রস্তুতি বেসিক",
    category: "free",
    price: 0,
    thumbnail: "/images/courses/free-bcs.jpg",
    duration: "১ মাস",
    lectures: 15,
    students: 12000,
    instructor: "Community Teachers",
    features: [
      "বিসিএস প্রস্তুতির ভূমিকা",
      "সিলেবাস বিশ্লেষণ",
      "স্টাডি প্ল্যান তৈরি",
    ],
    description: "বিসিএস প্রস্তুতি শুরু করার জন্য ফ্রি কোর্স।",
    syllabus: [],
    isFeatured: true,
  },
  // Add more courses for pagination testing
    {
    id: "10",
    title: "Advanced English for BCS",
    titleBangla: "এডভান্স ইংরেজি কোর্স",
    category: "regular-bcs",
    price: 4990,
    thumbnail: "/images/courses/english.jpg",
    duration: "২ মাস",
    lectures: 45,
    students: 3500,
    instructor: "English Expert",
    features: ["ইংরেজি গ্রামার", "ভোকাবুলারি", "রিডিং কম্প্রিহেনশন"],
    description: "বিসিএস ইংরেজি পরীক্ষার জন্য উন্নত কোর্স।",
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
