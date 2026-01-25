// lib/api.ts - Complete Fixed Version
import { Answer, Result, ResultDetailed } from "./types";

const API_BASE_URL = "http://127.0.0.1:8000/api";

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
const setCookie = (name: string, value: string, days: number = 1) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
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
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || getCookie("token")
          : null;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // ============================================================================
  // IMAGE UPLOAD - ADDED FOR PC IMAGE UPLOAD FUNCTIONALITY
  // ============================================================================
  /**
   * Uploads a question image from PC to the server
   *
   * Current Implementation: Stores in Frontend/public/questions folder
   *
   * 🔄 FUTURE AWS S3 INTEGRATION:
   * When migrating to AWS S3, modify the backend endpoint to upload to S3
   * and return the S3 URL. This frontend method will remain unchanged.
   *
   * @param file - Image file from user's PC
   * @returns Public URL of the uploaded image
   */
  async uploadQuestionImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    // Get token for authentication
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || getCookie("token")
        : null;

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // NOTE: Don't set Content-Type header - browser will set it automatically with boundary for multipart/form-data
    const response = await fetch(`${API_BASE_URL}/upload/question-image`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to upload image");
    }

    const data = await response.json();
    return data.url; // Returns public URL (e.g., /questions/abc123.jpg)
  }
  // ============================================================================
  // END IMAGE UPLOAD
  // ============================================================================

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setCookie("token", data.token, 1);
    setCookie("user_role", data.user.role, 1);

    return data;
  }

  async register(userData: RegisterData): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    const data = await response.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setCookie("token", data.token, 1);
    setCookie("user_role", data.user.role, 1);

    return data;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    deleteCookie("token");
    deleteCookie("user_role");
  }

  getCurrentUser() {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!(localStorage.getItem("token") || getCookie("token"));
  }

  // User/Admin APIs
  async getAllUsers() {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    // Handle both direct array and wrapped response formats
    return Array.isArray(data) ? data : data.data || data.users || [];
  }

  async enrollUserInCourse(enrollmentData: CourseEnrollmentData) {
    const response = await fetch(`${API_BASE_URL}/users/enroll`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(enrollmentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to enroll user in course");
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
      throw new Error(error.detail || "Failed to fetch course");
    }

    return response.json();
  }

  async getAllCourses() {
    const response = await fetch(`${API_BASE_URL}/course/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch courses");
    }

    return response.json();
  }
// lib/api.ts - Line 241 এর কাছে
async getAllExams(courseId?: number) {
  let url = `${API_BASE_URL}/exams/`; // ✅ CHANGED: /exam/ → /exams/
  if (courseId) {
    url += `?course_id=${courseId}`;
  }
  const response = await fetch(url, {
    headers: this.getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch exams");
  }

  return response.json();
}

async getExamById(examId: number) {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}`, { // ✅ CHANGED
    headers: this.getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch exam");
  }

  return response.json();
}

async createExam(examData: any) {
  const response = await fetch(`${API_BASE_URL}/exams/`, { // ✅ CHANGED
    method: "POST",
    headers: this.getHeaders(),
    body: JSON.stringify(examData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create exam");
  }

  return response.json();
}

async updateExam(examId: number, examData: any) {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}`, { // ✅ CHANGED
    method: "PUT",
    headers: this.getHeaders(),
    body: JSON.stringify(examData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update exam");
  }

  return response.json();
}

async deleteExam(examId: number) {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}`, { // ✅ CHANGED
    method: "DELETE",
    headers: this.getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete exam");
  }

  return response.json();
}

async addQuestionToExam(examId: number, questionData: any) {
  const response = await fetch(
    `${API_BASE_URL}/exams/${examId}/add-question`, // ✅ CHANGED
    {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(questionData),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to add question");
  }

  return response.json();
}

async bulkUploadQuestions(examId: number, questionsData: any[]) {
  const response = await fetch(
    `${API_BASE_URL}/exams/${examId}/bulk-questions`, // ✅ CHANGED
    {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ questions: questionsData }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to bulk upload questions");
  }

  return response.json();
}

async deleteQuestion(examId: number, questionId: number) {
  const response = await fetch(
    `${API_BASE_URL}/exams/${examId}/questions/${questionId}`, // ✅ CHANGED
    {
      method: "DELETE",
      headers: this.getHeaders(),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete question");
  }

  return response.json();
}

async uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/exams/upload-image`, { // ✅ CHANGED
    method: "POST",
    headers: this.getHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to upload image");
  }

  return response.json();
}

async updateQuestion(examId: number, questionId: number, questionData: any) {
  const response = await fetch(
    `${API_BASE_URL}/exams/${examId}/questions/${questionId}`, // ✅ CHANGED
    {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(questionData),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update question");
  }

  return response.json();
}

async submitExam(examId: number, answers: Answer[]): Promise<Result> {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/submit`, { // ✅ CHANGED
    method: "POST",
    headers: this.getHeaders(),
    body: JSON.stringify(answers),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to submit exam");
  }

  return response.json();
}

async getDetailedExamResult(examId: number): Promise<ResultDetailed> {
  const response = await fetch(
    `${API_BASE_URL}/exams/${examId}/result/details`, // ✅ CHANGED
    {
      headers: this.getHeaders(),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch detailed result");
  }

  return response.json();
}

// Course APIs - এইগুলাও update করো
async getCourseById(courseId: string) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, { // ✅ CHANGED
    headers: this.getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch course");
  }

  return response.json();
}

async getAllCourses() {
  const response = await fetch(`${API_BASE_URL}/courses/`, { // ✅ CHANGED
    headers: this.getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  return response.json();
}
}

export const apiService = new ApiService();
export default apiService;
