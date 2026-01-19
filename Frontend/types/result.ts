
// types/result.ts
import { Exam } from './exam';

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
  attempt_number: number;
  created_at: string;
}

export interface ResultDetailed extends Result {
  answers_details: AnswerDetail[];
  exam: Exam;
}

export interface AnswerDetail {
  question_id: number;
  exam_id: number;
  selected_option?: number;
  submitted_answer_text?: string;
  is_correct?: boolean;
  correct_option_index?: number;
  marks_obtained: number;
}