// services/authService.ts
import type{ AuthResponse, SignUpData, SignInData, MessageResponse, ForgotPasswordRequest, OTPRequest, UserProfile } from '../types/auth';

// Update this URL to match your hosted backend
const API_BASE_URL = 'http://localhost:8000'; // Change this to your actual backend URL

class AuthService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  private getAuthHeaders(token?: string): HeadersInit {
    const authToken = token || localStorage.getItem('auth_token');
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }

  async signUp(userData: SignUpData): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(userData: SignInData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async signInWithOTP(request: OTPRequest): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>('/signin-otp', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async signOut(): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>('/signout', {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
  }

  async getProfile(): Promise<UserProfile> {
    return this.makeRequest<UserProfile>('/profile', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }
}

export const authService = new AuthService();