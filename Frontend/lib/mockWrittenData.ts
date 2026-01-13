// lib/mockWrittenData.ts

export interface WrittenQuestion {
  id: number;
  content: string;
  marks: number;
  exam_id: number;
}

export interface WrittenExam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  status: string;
  course_id: number;
  is_premium: boolean;
}

export interface WrittenAnswer {
  question_id: number;
  image_urls?: string[];
  image_files?: File[];
  text_answer?: string;
}

export interface WrittenResult {
  id: number;
  exam_id: number;
  user_id: number;
  total_marks: number;
  obtained_marks?: number;
  evaluation_status: "pending" | "evaluated";
  evaluated_at?: string;
  moderator_feedback?: string;
  answers: WrittenAnswer[];
}

export const mockWrittenExams: WrittenExam[] = [
  {
    id: 1,
    title: "BCS Written Exam - Bangla",
    description: "বাংলা রচনা ও ব্যাকরণ",
    duration_minutes: 30,
    total_marks: 20,
    status: "active",
    course_id: 1,
    is_premium: false
  },
  {
    id: 2,
    title: "BCS Written Exam - English Essay",
    description: "English Composition and Grammar",
    duration_minutes: 40,
    total_marks: 25,
    status: "active",
    course_id: 1,
    is_premium: true
  }
];

export const mockWrittenQuestions: WrittenQuestion[] = [
  // Exam 1 Questions
  {
    id: 1,
    exam_id: 1,
    content: "বাংলাদেশের মুক্তিযুদ্ধের তাৎপর্য ব্যাখ্যা করুন। (সর্বোচ্চ ২০০ শব্দ)",
    marks: 10
  },
  {
    id: 2,
    exam_id: 1,
    content: "পরিবেশ দূষণ ও তার প্রতিকার সম্পর্কে একটি প্রবন্ধ লিখুন। (সর্বোচ্চ ২০০ শব্দ)",
    marks: 10
  },

  // Exam 2 Questions
  {
    id: 3,
    exam_id: 2,
    content: "Write an essay on 'Digital Bangladesh' (Maximum 250 words)",
    marks: 15
  },
  {
    id: 4,
    exam_id: 2,
    content: "Explain the importance of women empowerment in modern society. (Maximum 200 words)",
    marks: 10
  }
];

export function getWrittenExamById(id: number): WrittenExam | undefined {
  return mockWrittenExams.find(exam => exam.id === id);
}

export function getWrittenQuestionsByExamId(examId: number): WrittenQuestion[] {
  return mockWrittenQuestions.filter(q => q.exam_id === examId);
}