import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, TIMEOUTS, RETRY_CONFIG } from './config';
import {
  ApiResponse,
  PaginatedResponse,
  UploadProgressCallback,
  FileUpload,
} from '@/types';

// ==================================
// TOKEN MANAGEMENT
// ==================================

class TokenManager {
  private static instance: TokenManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async loadTokensFromStorage(): Promise<void> {
    try {
      // Use the same storage key as Zustand authStore
      const authData = await AsyncStorage.getItem('yu-card-auth');
      if (authData) {
        const parsedData = JSON.parse(authData);
        // Zustand stores: { state: { token, refreshToken, ... } }
        const state = parsedData.state || parsedData;

        // Validate tokens exist and are strings
        const accessToken = state.token && typeof state.token === 'string' ? state.token : null;
        const refreshToken = state.refreshToken && typeof state.refreshToken === 'string' ? state.refreshToken : null;

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        console.log('📦 Tokens loaded from storage:', {
          hasAccessToken: !!this.accessToken,
          hasRefreshToken: !!this.refreshToken,
          accessTokenLength: this.accessToken?.length || 0,
          refreshTokenLength: this.refreshToken?.length || 0
        });
      } else {
        console.log('📦 No tokens found in storage');
        this.accessToken = null;
        this.refreshToken = null;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load tokens from storage:', error);
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  async saveTokensToStorage(accessToken: string, refreshToken: string): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    console.log('Tokens saved to memory:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    // Note: We don't write to AsyncStorage directly here
    // The authStore handles persistence via Zustand
    // We only update in-memory tokens
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshPromise = null;

    console.log('Tokens cleared from memory');

    // Note: We don't clear AsyncStorage directly here
    // The authStore handles this via its clearAuth/logout methods
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this._performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performTokenRefresh(): Promise<string> {
    try {
      // Ensure we have the latest refresh token from storage
      if (!this.refreshToken) {
        await this.loadTokensFromStorage();
      }

      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Attempting token refresh...');
      const response = await axios.post(
        `${API_ENDPOINTS.API_BASE}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken: this.refreshToken },
        { timeout: TIMEOUTS.AUTH }
      );

      // Backend returns: { success, message, data: { tokens: { accessToken, refreshToken } } }
      const tokens = response.data?.data?.tokens;
      if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
        console.error('❌ Invalid refresh response structure:', response.data);
        throw new Error('Invalid refresh token response');
      }

      await this.saveTokensToStorage(tokens.accessToken, tokens.refreshToken);
      console.log('✅ Token refreshed successfully');

      return tokens.accessToken;
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error.response?.status, error.message);

      // If refresh token is invalid/expired (401), clear all tokens
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('🔒 Refresh token expired, clearing all tokens');
        await this.clearTokens();
        throw new Error('Refresh token expired');
      }

      // For other errors, clear tokens as well
      await this.clearTokens();
      throw new Error('Token refresh failed');
    }
  }
}

// ==================================
// REQUEST QUEUE MANAGER
// ==================================

interface QueuedRequest {
  config: AxiosRequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestQueueManager {
  private queue: QueuedRequest[] = [];
  private isRefreshing = false;

  addToQueue(config: AxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ config, resolve, reject });
    });
  }

  processQueue(error?: AxiosError): void {
    const requests = this.queue.splice(0);
    requests.forEach(({ config, resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        // Retry the request with new token
        resolve(apiClient.request(config));
      }
    });
  }

  setRefreshing(refreshing: boolean): void {
    this.isRefreshing = refreshing;
  }

  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }
}

// ==================================
// API CLIENT CLASS
// ==================================

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private requestQueue: RequestQueueManager;

  constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.requestQueue = new RequestQueueManager();

    this.axiosInstance = axios.create({
      baseURL: API_ENDPOINTS.API_BASE,
      timeout: TIMEOUTS.DEFAULT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.initializeTokens();
  }

  private async initializeTokens(): Promise<void> {
    await this.tokenManager.loadTokensFromStorage();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.tokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;

          // Debug: Log token info for troubleshooting (only in development)
          if (__DEV__) {
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                // Simple JWT base64url decode (React Native compatible)
                let base64 = tokenParts[1]
                  .replace(/-/g, '+')
                  .replace(/_/g, '/');

                // Add padding if necessary
                const pad = base64.length % 4;
                if (pad) {
                  base64 += '='.repeat(4 - pad);
                }

                // Decode base64 to string (React Native compatible)
                const decoded = Buffer.from(base64, 'base64').toString('utf-8');
                const payload = JSON.parse(decoded);

                console.log('🔑 Token info:', {
                  userId: payload.userId,
                  role: payload.role,
                  exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
                  isExpired: payload.exp ? Date.now() > payload.exp * 1000 : false,
                });
              }
            } catch (e) {
              // Silent fail - token parsing is not critical
            }
          }
        } else {
          console.warn('⚠️ No auth token available for request:', config.url);
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Check if this is a refresh token request that failed
          const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

          if (isRefreshRequest) {
            console.log('🔒 Refresh token request failed with 401, clearing auth');
            this.requestQueue.setRefreshing(false);
            this.requestQueue.processQueue(error);
            this.handleAuthFailure();
            return Promise.reject(new Error('Refresh token expired'));
          }

          originalRequest._retry = true;

          // If already refreshing, queue the request
          if (this.requestQueue.isCurrentlyRefreshing()) {
            console.log('⏳ Request queued while token refresh in progress');
            return this.requestQueue.addToQueue(originalRequest);
          }

          this.requestQueue.setRefreshing(true);

          try {
            console.log('🔄 401 detected, attempting token refresh...');
            await this.tokenManager.refreshAccessToken();
            this.requestQueue.processQueue();
            this.requestQueue.setRefreshing(false);

            // Retry the original request with new token
            console.log('✅ Retrying original request with new token');
            return this.axiosInstance.request(originalRequest);
          } catch (refreshError) {
            console.log('❌ Token refresh failed, clearing queue and logging out');
            this.requestQueue.processQueue(error);
            this.requestQueue.setRefreshing(false);

            // Redirect to login or emit auth failure event
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private handleAuthFailure(): void {
    // This should trigger a logout and redirect to login screen
    console.log('🔒 Authentication failed, user should be logged out');

    // Import dynamically to avoid circular dependencies
    import('../stores/authStore').then(({ useAuthStore }) => {
      const authStore = useAuthStore.getState();
      console.log('🚪 Forcing logout due to auth failure...');
      authStore.clearAuth().catch(err => {
        console.error('Failed to clear auth:', err);
      });
    }).catch(err => {
      console.error('Failed to import authStore:', err);
    });
  }

  // ==================================
  // CORE REQUEST METHODS
  // ==================================

  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      // Log outgoing request
      console.log('🌐 API Request:', {
        method: config.method,
        url: config.url,
        fullURL: `${this.axiosInstance.defaults.baseURL}${config.url}`,
        data: config.data,
      });

      const response = await this.axiosInstance.request<ApiResponse<T>>(config);

      console.log('📥 API Response:', {
        url: config.url,
        status: response.status,
        success: response.data.success,
        hasData: !!response.data.data,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('❌ API Request failed (success=false):', {
          url: config.url,
          method: config.method,
          success: response.data.success,
          message: response.data.message,
          error: response.data.error,
        });
        throw new Error(response.data.message || response.data.error || 'Request failed');
      }
    } catch (error) {
      // Don't log 404 errors as critical errors (they're expected in gift-card/product lookups)
      const is404 = axios.isAxiosError(error) && error.response?.status === 404;

      if (!is404) {
        console.error('❌ API Request threw error:', {
          url: config.url,
          method: config.method,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      } else {
        console.log('🔍 Resource not found (404):', config.url);
      }

      throw this.handleError(error);
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // ==================================
  // SPECIALIZED METHODS
  // ==================================

  async getPaginated<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<T>> {
    // Clean params: remove undefined, null, empty strings
    const cleanParams = params ? Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>) : {};

    return this.get<PaginatedResponse<T>>(url, {
      ...config,
      params: { ...cleanParams, ...config?.params },
    });
  }

  async upload<T = any>(
    url: string,
    files: FileUpload | FileUpload[],
    data?: Record<string, any>,
    onProgress?: UploadProgressCallback,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();

    // Add files to form data
    const fileArray = Array.isArray(files) ? files : [files];

    // Déterminer le nom de champ selon l'endpoint
    const getFieldName = (url: string, isMultiple: boolean): string => {
      if (url.includes('/avatar')) return 'avatar';
      if (url.includes('/category-icon')) return 'icon';
      if (url.includes('/document')) return 'document';
      if (url.includes('/product-images') || url.includes('/gift-card-images') || url.includes('/images')) {
        return 'images'; // Backend attend 'images' pour les uploads multiples
      }
      return isMultiple ? 'images' : 'image';
    };

    const fieldName = getFieldName(url, Array.isArray(files));

    console.log('[ApiClient] Upload details:', {
      url,
      fieldName,
      fileCount: fileArray.length,
      isArray: Array.isArray(files),
    });

    fileArray.forEach((file) => {
      formData.append(fieldName, file as any);
    });

    // Add additional data
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      timeout: TIMEOUTS.UPLOAD,
      onUploadProgress: onProgress
        ? (progressEvent) => {
            if (progressEvent.total) {
              onProgress({
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
              });
            }
          }
        : undefined,
    });
  }

  // ==================================
  // TOKEN MANAGEMENT METHODS
  // ==================================

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.tokenManager.saveTokensToStorage(accessToken, refreshToken);
  }

  async clearTokens(): Promise<void> {
    await this.tokenManager.clearTokens();
  }

  getAccessToken(): string | null {
    return this.tokenManager.getAccessToken();
  }

  // ==================================
  // ERROR HANDLING
  // ==================================

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;

      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;

        // Handle errors array (from validation)
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const errorMessages = errorData.errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (typeof err === 'object' && err.message) return err.message;
            if (typeof err === 'object' && err.field && err.message) {
              return `${err.field}: ${err.message}`;
            }
            return JSON.stringify(err);
          });
          return new Error(errorMessages.join(', '));
        }

        return new Error(errorData.message || errorData.error || 'Request failed');
      }

      if (axiosError.request) {
        return new Error('Network error: Unable to reach server');
      }

      return new Error(axiosError.message || 'Request failed');
    }

    return error instanceof Error ? error : new Error('Unknown error occurred');
  }

  // ==================================
  // HEALTH CHECK
  // ==================================

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.BASE_URL}/health`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================================
  // TOKEN ACCESS
  // ==================================

  /**
   * Get the current authentication token
   * Useful for direct HTTP requests (like file downloads)
   */
  async getAuthToken(): Promise<string | null> {
    return this.tokenManager.getAccessToken();
  }
}

// ==================================
// SINGLETON INSTANCE
// ==================================

export const apiClient = new ApiClient();
export default apiClient;