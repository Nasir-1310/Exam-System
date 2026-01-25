// types/exam.ts
export interface Question {
  id: number;
  q_type: 'MCQ' | 'WRITTEN';
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
  start_time: string;
  duration_minutes: number;
  mark: number;
  minus_mark: number;
  course_id?: number;
  is_active: boolean;
  allow_multiple_attempts: boolean;
  show_detailed_results_after?: string;
  questions?: Question[];
  created_at?: string;
}

export interface ExamCreate {
  title: string;
  description: string;
  start_time: string;
  duration_minutes: number;
  mark: number;
  minus_mark: number;
  course_id?: number;
  is_active: boolean;
  allow_multiple_attempts: boolean;
  show_detailed_results_after?: string;
  questions: QuestionCreate[];
}

export interface QuestionCreate {
  q_type: 'MCQ' | 'WRITTEN';
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