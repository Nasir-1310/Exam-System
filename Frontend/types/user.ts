// types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  active_mobile: string;
  whatsapp?: string;
  dob?: string;
  created_at?: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  active_mobile: string;
  whatsapp?: string;
  dob?: string;
  role?: 'ADMIN' | 'MODERATOR' | 'USER';
}

export interface UserUpdate {
  name?: string;
  email?: string;
  active_mobile?: string;
  whatsapp?: string;
  dob?: string;
  role?: 'ADMIN' | 'MODERATOR' | 'USER';
}

export interface UserCourseEnrollment {
  user_id: number;
  course_id: number;
}
