import { env } from './env';
import { ApiResponse, ApiError } from '@/types/api';

// API Client Configuration
class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = env.API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get authentication token from storage
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  // Set authentication token
  setAuthToken(token: string, remember: boolean = false) {
    if (typeof window === 'undefined') return;
    
    if (remember) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }

  // Remove authentication token
  removeAuthToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }

  // Build request headers
  private buildHeaders(headers?: HeadersInit): HeadersInit {
    const requestHeaders = { ...this.defaultHeaders, ...headers };
    
    const token = this.getAuthToken();
    if (token) {
      (requestHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    return requestHeaders;
  }

  // Build full URL
  private buildURL(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = {
        success: false,
        error: data?.error || data?.message || `HTTP ${response.status}`,
        statusCode: response.status,
        details: data?.details,
      };
      throw error;
    }

    // Laravel returns data directly, so we wrap it in our ApiResponse format
    return {
      success: true,
      data: data,
      message: data?.message
    } as ApiResponse<T>;
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(this.buildURL(endpoint));
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    const response = await fetch(this.buildURL(endpoint), {
      method: 'POST',
      headers: this.buildHeaders(headers),
      body: data instanceof FormData ? data : JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    const response = await fetch(this.buildURL(endpoint), {
      method: 'PUT',
      headers: this.buildHeaders(headers),
      body: data instanceof FormData ? data : JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any, headers?: HeadersInit): Promise<ApiResponse<T>> {
    const response = await fetch(this.buildURL(endpoint), {
      method: 'PATCH',
      headers: this.buildHeaders(headers),
      body: data instanceof FormData ? data : JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(this.buildURL(endpoint), {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // File upload helper
  async uploadFile<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers = { ...this.defaultHeaders };
    delete (headers as any)['Content-Type'];

    return this.post<T>(endpoint, formData, headers);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility function for handling API errors
export function handleApiError(error: unknown): string {
  if (error && typeof error === 'object' && 'error' in error) {
    return (error as ApiError).error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Utility function for checking if user is authenticated
export function isAuthenticated(): boolean {
  return apiClient.getAuthToken() !== null;
}