// types/course.ts
export interface Course {
  id: number;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseCreate {
  title: string;
  description: string;
}

export interface CourseUpdate {
  title?: string;
  description?: string;
}