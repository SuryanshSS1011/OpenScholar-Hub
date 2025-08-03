import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Create axios instance with default configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: error.message || 'An unexpected error occurred',
        status: error.response?.status,
        code: error.code,
      };

      // Handle specific error cases
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/auth/signin';
        }
      }

      return Promise.reject(apiError);
    }
  );

  return instance;
};

const api = createApiInstance();

// Generic API methods
export const apiClient = {
  get: async <T>(url: string, config?: any): Promise<T> => {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.post<ApiResponse<T>>(url, data);
    return response.data.data;
  },

  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.put<ApiResponse<T>>(url, data);
    return response.data.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await api.delete<ApiResponse<T>>(url);
    return response.data.data;
  },

  patch: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.patch<ApiResponse<T>>(url, data);
    return response.data.data;
  },
};

export default api;