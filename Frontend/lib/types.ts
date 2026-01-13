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