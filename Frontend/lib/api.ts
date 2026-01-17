// lib/api.ts - Complete Fixed Version
import { Answer, Result, ResultDetailed } from "./types";

const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  active_mobile: string;
  whatsapp?: string;
  role?: string;
}

interface TokenResponse {
  token: string;
  expires_in: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

interface CourseEnrollmentData {
  user_id: number;
  course_id: number;
}

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

class ApiService {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = typeof window !== 'undefined' 
        ? (localStorage.getItem('token') || getCookie('token'))
        : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCookie('token', data.token, 7);
    setCookie('user_role', data.user.role, 7);
    
    return data;
  }

  async register(userData: RegisterData): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data = await response.json();
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setCookie('token', data.token, 7);
    setCookie('user_role', data.user.role, 7);
    
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    deleteCookie('token');
    deleteCookie('user_role');
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem('token') || getCookie('token'));
  }

  // User/Admin APIs
  async enrollUserInCourse(enrollmentData: CourseEnrollmentData) {
    const response = await fetch(`${API_BASE_URL}/users/enroll`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(enrollmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to enroll user in course');
    }
    return response.json();
  }

  // Course APIs
  async getCourseById(courseId: string) {
    const response = await fetch(`${API_BASE_URL}/course/${courseId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch course');
    }

    return response.json();
  }

  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/course/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json();
  }

  // Exam APIs
  async getAllExams(courseId?: number) {
    let url = `${API_BASE_URL}/exam/`;
    if (courseId) {
      url += `?course_id=${courseId}`;
    }
    const response = await fetch(url, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exams');
    }

    return response.json();
  }

  async getExamById(examId: number) {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch exam');
    }

    return response.json();
  }

  async createExam(examData: any) {
    const response = await fetch(`${API_BASE_URL}/exam/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create exam');
    }

    return response.json();
  }

  async updateExam(examId: number, examData: any) {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update exam');
    }

    return response.json();
  }

  async deleteExam(examId: number) {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete exam');
    }

    return response.json();
  }

  async addQuestionToExam(examId: number, questionData: any) {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}/add-question`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add question');
    }

    return response.json();
  }

  async bulkUploadQuestions(examId: number, questionsData: any[]) {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}/bulk-questions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ questions: questionsData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to bulk upload questions');
    }

    return response.json();
  }

  async deleteQuestion(examId: number, questionId: number) {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}/questions/${questionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete question');
    }

    return response.json();
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/exam/upload-image`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload image');
    }

    return response.json();
  }

  async updateQuestion(examId: number, questionId: number, questionData: any) {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}/questions/${questionId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update question');
    }

    return response.json();
  }

  async submitExam(examId: number, answers: Answer[]): Promise<Result> {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(answers),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit exam');
    }

    return response.json();
  }

  async getDetailedExamResult(examId: number): Promise<ResultDetailed> {
    const response = await fetch(`${API_BASE_URL}/exam/${examId}/result/details`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch detailed result');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;
