
// types/result.ts
import { Exam } from './exam';

export interface Answer {
  question_id: number;
  selected_option?: number;
  submitted_answer_text?: string;
  uploaded_file?: string;
}

export interface Result {
  id: number;
  exam_id: number;
  user_id: number;
  correct_answers: number;
  incorrect_answers: number;
  mark: number;
  attempt_number: number;
  submission_time: string;
  written_submission_file?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    active_mobile?: string;
  };
  exam?: {
    id: number;
    title: string;
    is_mcq?: boolean;
  };
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
  uploaded_file?: string;
  is_correct?: boolean;
  correct_option_index?: number;
  marks_obtained: number;
}