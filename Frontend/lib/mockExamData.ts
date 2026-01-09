// lib/mockExamData.ts

export interface Question {
  id: number;
  content: string;
  options: string[];
  answer_idx: number;
  exam_id: number;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  status: string;
  course_id: number;
  is_premium: boolean;
}

export const mockExams: Exam[] = [
  {
    id: 1,
    title: "BCS Preliminary Mock Test - 1",
    description: "বাংলাদেশ বিষয়াবলী এবং সাধারণ জ্ঞান",
    duration_minutes: 20,
    total_marks: 10,
    status: "active",
    course_id: 1,
    is_premium: false
  },
  {
    id: 2,
    title: "BCS Preliminary Mock Test - 2",
    description: "English Grammar and Literature",
    duration_minutes: 25,
    total_marks: 10,
    status: "active",
    course_id: 1,
    is_premium: true
  }
];

export const mockQuestions: Question[] = [
  // Exam 1 Questions
  {
    id: 1,
    exam_id: 1,
    content: "বাংলাদেশের জাতীয় ফুল কোনটি?",
    options: ["গোলাপ", "শাপলা", "জবা", "সূর্যমুখী"],
    answer_idx: 1
  },
  {
    id: 2,
    exam_id: 1,
    content: "বাংলাদেশের স্বাধীনতা দিবস কবে?",
    options: ["২১ ফেব্রুয়ারি", "১৬ ডিসেম্বর", "২৬ মার্চ", "১৪ এপ্রিল"],
    answer_idx: 2
  },
  {
    id: 3,
    exam_id: 1,
    content: "বাংলাদেশের রাজধানী কোথায়?",
    options: ["চট্টগ্রাম", "সিলেট", "ঢাকা", "রাজশাহী"],
    answer_idx: 2
  },
  {
    id: 4,
    exam_id: 1,
    content: "বাংলাদেশের মুদ্রার নাম কি?",
    options: ["টাকা", "রুপি", "ডলার", "পাউন্ড"],
    answer_idx: 0
  },
  {
    id: 5,
    exam_id: 1,
    content: "বাংলাদেশের জাতীয় পাখি কোনটি?",
    options: ["কাক", "দোয়েল", "ময়না", "টিয়া"],
    answer_idx: 1
  },
  {
    id: 6,
    exam_id: 1,
    content: "বাংলাদেশের সর্ববৃহৎ নদী কোনটি?",
    options: ["পদ্মা", "মেঘনা", "যমুনা", "ব্রহ্মপুত্র"],
    answer_idx: 0
  },
  {
    id: 7,
    exam_id: 1,
    content: "বাংলাদেশের জাতীয় কবি কে?",
    options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জসীমউদ্দীন", "শামসুর রাহমান"],
    answer_idx: 1
  },
  {
    id: 8,
    exam_id: 1,
    content: "বাংলাদেশের মোট জেলার সংখ্যা কত?",
    options: ["৬০", "৬৪", "৬৮", "৭০"],
    answer_idx: 1
  },
  {
    id: 9,
    exam_id: 1,
    content: "বাংলাদেশের বৃহত্তম বিভাগ কোনটি?",
    options: ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা"],
    answer_idx: 1
  },
  {
    id: 10,
    exam_id: 1,
    content: "বাংলাদেশের একমাত্র প্রবাল দ্বীপ কোনটি?",
    options: ["সেন্ট মার্টিন", "কুতুবদিয়া", "মহেশখালী", "নিঝুম দ্বীপ"],
    answer_idx: 0
  },

  // Exam 2 Questions
  {
    id: 11,
    exam_id: 2,
    content: "What is the past tense of 'go'?",
    options: ["goed", "went", "gone", "going"],
    answer_idx: 1
  },
  {
    id: 12,
    exam_id: 2,
    content: "Which is the correct spelling?",
    options: ["recieve", "receive", "recive", "receeve"],
    answer_idx: 1
  },
  {
    id: 13,
    exam_id: 2,
    content: "What is the plural of 'child'?",
    options: ["childs", "childrens", "children", "childes"],
    answer_idx: 2
  },
  {
    id: 14,
    exam_id: 2,
    content: "Choose the correct article: ___ apple a day keeps the doctor away.",
    options: ["A", "An", "The", "No article"],
    answer_idx: 1
  },
  {
    id: 15,
    exam_id: 2,
    content: "What is the synonym of 'happy'?",
    options: ["sad", "joyful", "angry", "tired"],
    answer_idx: 1
  },
  {
    id: 16,
    exam_id: 2,
    content: "Identify the verb in: 'She runs every morning.'",
    options: ["She", "runs", "every", "morning"],
    answer_idx: 1
  },
  {
    id: 17,
    exam_id: 2,
    content: "What is the opposite of 'difficult'?",
    options: ["hard", "easy", "complex", "tough"],
    answer_idx: 1
  },
  {
    id: 18,
    exam_id: 2,
    content: "Choose the correct sentence:",
    options: [
      "He don't like coffee",
      "He doesn't likes coffee",
      "He doesn't like coffee",
      "He not like coffee"
    ],
    answer_idx: 2
  },
  {
    id: 19,
    exam_id: 2,
    content: "What is the comparative form of 'good'?",
    options: ["gooder", "better", "best", "more good"],
    answer_idx: 1
  },
  {
    id: 20,
    exam_id: 2,
    content: "Identify the noun: 'The quick brown fox jumps.'",
    options: ["quick", "brown", "fox", "jumps"],
    answer_idx: 2
  }
];

export function getExamById(id: number): Exam | undefined {
  return mockExams.find(exam => exam.id === id);
}

export function getQuestionsByExamId(examId: number): Question[] {
  return mockQuestions.filter(q => q.exam_id === examId);
}