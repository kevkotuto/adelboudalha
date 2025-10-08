import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenResponse,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/types';

// ==================================
// AUTHENTICATION SERVICE
// ==================================

export class AuthService {
  /**
   * Login user with phone and password
   */
  async login(phone: string, password: string): Promise<AuthResponse> {
    const formattedPhone = authHelpers.formatPhoneNumber(phone);
    const loginData: LoginRequest = { phone: formattedPhone, password };

    console.log('🔄 Starting login for:', formattedPhone);

    try {
      // apiClient.post automatically unwraps { success, message, data } -> data
      // Backend can return two formats:
      // 1. Phone verified: { user, tokens }
      // 2. Phone not verified: { userId, phone, phoneVerified: false }
      const response = await apiClient.post<{
        user?: User;
        userId?: string;
        phone?: string;
        phoneVerified?: boolean;
        tokens?: {
          accessToken: string;
          refreshToken: string;
          expiresIn: number;
        };
      }>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData
      );

      console.log('📥 Login API response:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Response keys:', response ? Object.keys(response) : 'undefined');

      // Case 1: Phone verification required
      if (response.phoneVerified === false || (!response.tokens && response.userId)) {
        console.log('📱 Phone verification required, throwing error');
        const error = new Error('Phone verification required. Please verify your phone number.') as any;
        error.code = 'PHONE_VERIFICATION_REQUIRED';
        error.data = { userId: response.userId, phone: response.phone };
        throw error;
      }

      // Case 2: Successful login with tokens
      if (!response || !response.tokens || !response.user) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid login response: missing tokens or user');
      }

      // Save tokens to client
      await apiClient.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken
      );

      // Return the response (already in correct format)
      return {
        user: response.user,
        tokens: response.tokens
      };
    } catch (error) {
      console.error('🚨 Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(
    phone: string,
    password: string,
    fullName: string,
    email?: string,
    language?: 'fr' | 'en' | 'ar' | 'es' | 'bm'
  ): Promise<{
    userId: string;
    phone: string;
    otpSent: boolean;
    otpExpiresAt: string;
  }> {
    // Format phone number for API
    const formattedPhone = authHelpers.formatPhoneNumber(phone);

    const registerData: RegisterRequest = {
      phone: formattedPhone,
      password,
      fullName,
      language: language || 'fr'
    };

    // Only add email if it's provided and not empty
    if (email && email.trim()) {
      registerData.email = email.trim();
    }

    console.log('📤 Sending registration request:', {
      ...registerData,
      password: '[HIDDEN]'
    });
    console.log('🔗 API Endpoint:', API_ENDPOINTS.AUTH.REGISTER);

    try {
      // apiClient.post automatically unwraps { success, message, data } -> data
      // So response will be the content of "data" field from backend
      const response = await apiClient.post<{
        userId: string;
        phone: string;
        email?: string | null;
        fullName: string;
        phoneVerified: boolean;
      }>(
        API_ENDPOINTS.AUTH.REGISTER,
        registerData
      );

      console.log('📥 Registration API response:', response);

      // Transform backend response to match our expected format
      return {
        userId: response.userId,
        phone: response.phone,
        otpSent: true, // Backend always sends OTP after registration
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
      };
    } catch (error) {
      console.error('🚨 Registration API error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    console.log('🔄 AuthService: Refreshing token...');
    const response = await apiClient.post<{ tokens: RefreshTokenResponse }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    // Backend returns: { success, message, data: { tokens: { accessToken, refreshToken } } }
    // apiClient.post unwraps to: { tokens: { accessToken, refreshToken } }
    if (!response.tokens) {
      console.error('❌ Invalid refresh response structure:', response);
      throw new Error('Invalid refresh response');
    }

    console.log('✅ AuthService: Token refreshed successfully');
    return response.tokens;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Don't throw on logout errors - we want to clear local state anyway
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear tokens locally
      await apiClient.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    // apiClient.get automatically unwraps { success, message, data } -> data
    // Backend returns { success, message, data: { user } }
    const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.PROFILE);
    return response.user;
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(
    phone: string,
    otp: string,
    type: 'registration' | 'login' | 'password_reset' | 'phone_verification'
  ): Promise<{
    verified: boolean;
    user?: User;
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }> {
    const otpData: VerifyOtpRequest = { phone, otp, type };

    // apiClient.post automatically unwraps { success, message, data } -> data
    const response = await apiClient.post<{
      user?: User;
      userId?: string;
      verified?: boolean;
      tokens?: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      };
    }>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      otpData
    );

    // Save tokens if provided (after successful registration/login verification)
    if (response.tokens) {
      await apiClient.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken
      );
    }

    // Transform backend response to match our expected format
    return {
      verified: true, // If we get here, OTP was verified successfully
      user: response.user,
      tokens: response.tokens
    };
  }

  /**
   * Resend OTP code
   */
  async resendOtp(
    phone: string,
    type: 'registration' | 'login' | 'password_reset' | 'phone_verification'
  ): Promise<{
    otpSent: boolean;
    expiresAt: string;
    attemptsRemaining: number;
  }> {
    const resendData: ResendOtpRequest = { phone, type };

    // Backend returns { success: true, message: "OTP sent successfully" }
    // We need to transform it to match our expected format
    await apiClient.post<void>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      resendData
    );

    // If no error was thrown, OTP was sent successfully
    return {
      otpSent: true,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      attemptsRemaining: 3 // Default value
    };
  }

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(phone: string): Promise<{ otpSent: boolean }> {
    const forgotData: ForgotPasswordRequest = { phone };

    // Backend returns { success: true, message: "..." }
    await apiClient.post<void>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      forgotData
    );

    // If no error was thrown, OTP was sent successfully
    return { otpSent: true };
  }

  /**
   * Reset password with OTP code
   */
  async resetPassword(
    phone: string,
    otp: string,
    newPassword: string
  ): Promise<{ passwordReset: boolean }> {
    const resetData: ResetPasswordRequest = { phone, otp, newPassword };

    // Backend returns { success: true, message: "Password reset successfully" }
    await apiClient.post<void>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      resetData
    );

    // If no error was thrown, password was reset successfully
    return { passwordReset: true };
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const changeData: ChangePasswordRequest = { currentPassword, newPassword };

    return await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      changeData
    );
  }

  /**
   * Verify if current token is valid
   */
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const user = await this.getProfile();
      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return apiClient.getAccessToken() !== null;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return apiClient.getAccessToken();
  }
}

// ==================================
// AUTHENTICATION HELPER FUNCTIONS
// ==================================

export const authHelpers = {
  /**
   * Format phone number for Côte d'Ivoire (+225)
   * Expected backend format: +225 + 10 chiffres = +2250123456789 (13 chars total)
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // If it already starts with 225, ensure it has 10 digits after +225
    if (digits.startsWith('225')) {
      const phoneDigits = digits.substring(3); // Get digits after 225
      if (phoneDigits.length >= 10) {
        return `+225${phoneDigits.substring(0, 10)}`; // Take first 10 digits
      } else {
        // Pad with zeros if less than 10 digits (for testing)
        return `+225${phoneDigits.padEnd(10, '0')}`;
      }
    }

    // If it's a local number starting with 0 (like 0123456789 - 10 digits)
    if (digits.length === 10 && digits.startsWith('0')) {
      return `+225${digits}`;  // +225 + 10 digits = 13 chars total
    }

    // If it's 10 digits without leading 0
    if (digits.length === 10) {
      return `+225${digits}`;  // +225 + 10 digits = 13 chars total
    }

    // If it's 9 digits, add leading 0
    if (digits.length === 9) {
      return `+2250${digits}`;  // +225 + 0 + 9 digits = 13 chars total
    }

    // If it's 8 digits, add leading 01
    if (digits.length === 8) {
      return `+22501${digits}`;  // +225 + 01 + 8 digits = 13 chars total
    }

    // For any other case, try to make it 10 digits with padding
    const paddedDigits = digits.padEnd(10, '0');
    return `+225${paddedDigits.substring(0, 10)}`;
  },

  /**
   * Validate phone number format for Côte d'Ivoire
   */
  isValidPhoneNumber(phone: string): boolean {
    const formatted = authHelpers.formatPhoneNumber(phone);
    // Côte d'Ivoire phone numbers: +225 + 10 digits = +2250123456789 (13 chars total)
    return /^\+225\d{10}$/.test(formatted);
  },

  /**
   * Validate password strength
   */
  validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }

    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Generate OTP code (for testing/mocking)
   */
  generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const authService = new AuthService();
export default authService;