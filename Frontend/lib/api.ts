// Frontend/lib/api.ts
const API_BASE_URL = 'http://127.0.0.1:8000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
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

class ApiService {
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
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
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Exam APIs
  async getAllExams() {
    const response = await fetch(`${API_BASE_URL}/exam/`, {
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
      throw new Error('Failed to fetch exam');
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

  // FIXED: Changed URL from /question/ to /questions/ (plural)
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

  // FIXED: Changed URL from /question/ to /questions/ (plural)
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

  async submitExam(examId: number, answers: number[]) {
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
}

export const apiService = new ApiService();
export default apiService;