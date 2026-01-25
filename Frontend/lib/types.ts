// src/lib/types.ts

export interface Course {
  id: string;
  title: string;
  titleBangla: string;
  category: CourseCategory;
  price: number;
  thumbnail: string;
  duration: string;
  lectures: number;
  students: number;
  instructor: string;
  features: string[];
  description: string;
  syllabus: SyllabusItem[];
  isFeatured?: boolean;
  isEarlyBird?: boolean;
  isEnrolled?: boolean;
  is_free?: boolean;

  live_class_url?: string;
  discount_start_date?: string;
  discount_end_date?: string;
  discount_price?: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
  discount?: number;
}

export type CourseCategory =
  | 'all'
  | 'free'
  | 'regular-bcs'
  | 'subjective-bcs'
  | 'bank'
  | 'am-club'
  | 'medical'
  | 'primary';

export interface SyllabusItem {
  id: string;
  title: string;
  topics: string[];
  isExpanded?: boolean;
}

export interface CourseFilter {
  category: CourseCategory;
  labelEn: string;
  labelBn: string;
  count?: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  coursesPerPage: number;
}

export interface Question {
  id: number;
  q_type: string;
  content: string;
  image_url?: string;
  description?: string;
  options?: string[];
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  option_a_image_url?: string;
  option_b_image_url?: string;
  option_c_image_url?: string;
  option_d_image_url?: string;
  answer?: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  start_time: string; // ISO string
  duration_minutes: number;
  mark: number;
  minus_mark: number;
  course_id?: number;
  questions: Question[];
  is_active: boolean;
  allow_multiple_attempts: boolean;
  show_detailed_results_after?: string; // ISO string
  is_premium?: boolean; // This was in ExamCardProps, keep for compatibility
}

export interface Answer {
  question_id: number;
  selected_option?: number;
  submitted_answer_text?: string;
}

export interface Result {
  id: number;
  exam_id: number;
  user_id: number;
  correct_answers: number;
  incorrect_answers: number;
  mark: number;
  submission_time: string;
  attempt_number: number;
}

export interface ResultDetailed extends Result {
  answers_details: AnswerDetail[];
}

export interface AnswerDetail {
  id: number;
  question_id: number;
  exam_id: number;
  result_id?: number;
  selected_option?: number;
  submitted_answer_text?: string;
  is_correct?: boolean;
  correct_option_index?: number;
  marks_obtained: number;
  question?: Question; // Include question details if needed for results display
}
