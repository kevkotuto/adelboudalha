import { User } from '@/stores/authStore';

// API Configuration
const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://api.yucard.com';

// Types
export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    return this.request<{ valid: boolean; user?: User }>('/auth/verify');
  }

  // User endpoints
  async getProfile(): Promise<User> {
    return this.request<User>('/user/profile');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Auth service functions
export const authService = {
  login: async (phoneNumber: string, password: string): Promise<AuthResponse> => {
    try {
      return await apiClient.login({ phoneNumber, password });
    } catch (error) {
      // Fallback for development/testing
      if (__DEV__) {
        console.warn('Using mock login response');
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              user: {
                id: '1',
                phoneNumber,
                firstName: 'User',
                lastName: 'Test',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              token: 'fake-jwt-token-' + Date.now(),
              refreshToken: 'fake-refresh-token-' + Date.now(),
            });
          }, 1500);
        });
      }
      throw error;
    }
  },

  register: async (phoneNumber: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> => {
    try {
      return await apiClient.register({ phoneNumber, password, firstName, lastName });
    } catch (error) {
      // Fallback for development/testing
      if (__DEV__) {
        console.warn('Using mock register response');
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              user: {
                id: '2',
                phoneNumber,
                firstName: firstName || 'User',
                lastName: lastName || 'Test',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              token: 'fake-jwt-token-' + Date.now(),
              refreshToken: 'fake-refresh-token-' + Date.now(),
            });
          }, 1500);
        });
      }
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      return await apiClient.refreshToken(refreshToken);
    } catch (error) {
      // Fallback for development/testing
      if (__DEV__) {
        console.warn('Using mock refresh token response');
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate 70% success rate
            if (Math.random() > 0.3) {
              resolve({
                token: 'new-fake-jwt-token-' + Date.now(),
                refreshToken: 'new-fake-refresh-token-' + Date.now(),
              });
            } else {
              reject(new Error('Refresh token expired'));
            }
          }, 1000);
        });
      }
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Don't throw on logout errors - we want to clear local state anyway
      console.warn('Logout API call failed:', error);
    }
  },

  verifyToken: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      return await apiClient.verifyToken();
    } catch (error) {
      // Fallback for development/testing
      if (__DEV__) {
        console.warn('Using mock token verification');
        return { valid: true };
      }
      return { valid: false };
    }
  },
};

// User service functions
export const userService = {
  getProfile: async (): Promise<User> => {
    return await apiClient.getProfile();
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return await apiClient.updateProfile(data);
  },
};

// Set token on API client when it changes
export const setApiToken = (token: string | null) => {
  apiClient.setToken(token);
};