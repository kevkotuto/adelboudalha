import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '@/services/authService';
import { apiClient } from '@/services/apiClient';
import { User, AuthResponse } from '@/types';
import { NotificationUtils } from '@/utils/notifications';

// User type is now imported from types

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  pendingRegistration: { phone: string; userId: string } | null;

  // Actions
  login: (phone: string, password: string) => Promise<boolean>;
  register: (phone: string, password: string, fullName: string, email?: string) => Promise<{ success: boolean; userId?: string; needsOTP?: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  setOnboardingComplete: () => void;

  // OTP Actions
  verifyOTP: (phone: string, code: string, type: 'registration' | 'login' | 'password_reset' | 'phone_verification') => Promise<boolean>;
  resendOTP: (phone: string, type: 'registration' | 'login' | 'password_reset' | 'phone_verification') => Promise<boolean>;
  forgotPassword: (phone: string) => Promise<boolean>;
  resetPassword: (phone: string, code: string, newPassword: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;

  // Temporary state for OTP flow
  pendingRegistration: { phone: string; userId: string } | null;
  setPendingRegistration: (data: { phone: string; userId: string } | null) => void;

  // Session management
  checkAuthStatus: () => Promise<void>;
  clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      pendingRegistration: null,

      // Login action
      login: async (phone: string, password: string) => {
        set({ isLoading: true });

        try {
          const response: AuthResponse = await authService.login(phone, password);

          set({
            user: response.user,
            token: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            hasCompletedOnboarding: response.user.hasCompletedOnboarding,
          });

          // Sync tokens with apiClient
          await apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken);

          // Register push notification token in the background (non-blocking)
          NotificationUtils.syncPushTokenWithAPI()
            .then(() => {
              console.log('✅ Push token synced after login');
            })
            .catch((error) => {
              console.error('⚠️ Failed to sync push token after login:', error);
              // Don't fail the login if push token sync fails
            });

          return true;
        } catch (error: any) {
          console.error('Login error:', error);

          // Handle phone verification required case
          if (error.code === 'PHONE_VERIFICATION_REQUIRED' && error.data) {
            console.log('📱 Phone not verified, sending OTP...');

            // Store pending data for OTP verification
            set({
              pendingRegistration: {
                phone: error.data.phone,
                userId: error.data.userId
              },
              isLoading: false
            });

            // Auto-send OTP for login verification
            try {
              await authService.resendOtp(error.data.phone, 'login');
              console.log('✅ OTP sent successfully for phone verification');
            } catch (otpError) {
              console.error('❌ Failed to send OTP:', otpError);
            }

            // Throw error with special code so the UI can handle navigation
            const navError = new Error('Phone verification required') as any;
            navError.code = 'PHONE_VERIFICATION_REQUIRED';
            navError.data = error.data;
            throw navError;
          }

          set({ isLoading: false });
          throw error;
        }
      },

      // Register action - returns registration initiation, requires OTP verification
      register: async (phone: string, password: string, fullName: string, email?: string) => {
        set({ isLoading: true });

        try {
          console.log('🔄 Starting registration for:', phone);
          const response = await authService.register(phone, password, fullName, email);
          console.log('✅ Registration response:', response);

          // Store pending registration data
          set({
            pendingRegistration: {
              phone: response.phone,
              userId: response.userId
            },
            isLoading: false
          });

          return {
            success: true,
            userId: response.userId,
            needsOTP: response.otpSent
          };
        } catch (error) {
          console.error('❌ Register error:', error);

          let errorMessage = 'Une erreur est survenue lors de l\'inscription';

          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              stack: error.stack
            });

            // Handle specific error cases
            if (error.message.includes('phone')) {
              errorMessage = 'Numéro de téléphone invalide';
            } else if (error.message.includes('already exists') || error.message.includes('existe déjà')) {
              errorMessage = 'Ce numéro de téléphone est déjà utilisé';
            } else if (error.message.includes('validation')) {
              errorMessage = 'Données invalides. Vérifiez vos informations';
            } else if (error.message.includes('network') || error.message.includes('timeout')) {
              errorMessage = 'Problème de connexion. Vérifiez votre internet';
            }
          }

          set({ isLoading: false });
          return {
            success: false,
            error: errorMessage
          };
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });

        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with logout even if API call fails
        }

        // Clear local state
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          hasCompletedOnboarding: false,
        });

        // Clear tokens from apiClient
        await apiClient.clearTokens();
      },

      // Refresh authentication
      refreshAuth: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          console.log('⚠️ No refresh token available');
          return false;
        }

        try {
          console.log('🔄 Attempting to refresh token via authStore...');
          const response = await authService.refreshToken(refreshToken);

          if (!response || !response.accessToken || !response.refreshToken) {
            console.error('❌ Invalid refresh response:', response);
            throw new Error('Invalid refresh response');
          }

          console.log('✅ Token refreshed successfully via authStore');
          set({
            token: response.accessToken,
            refreshToken: response.refreshToken,
          });

          // Also update apiClient tokens
          await apiClient.setTokens(response.accessToken, response.refreshToken);

          return true;
        } catch (error) {
          console.error('❌ Refresh auth error:', error);
          // Clear auth on refresh failure
          await get().clearAuth();
          return false;
        }
      },

      // Update user data
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = {
            ...user,
            ...userData,
            updatedAt: new Date().toISOString(),
          };
          console.log('📝 Updating user in store:', updatedUser.fullName);
          set({
            user: updatedUser,
          });
        }
      },

      // Set onboarding complete
      setOnboardingComplete: () => {
        set({ hasCompletedOnboarding: true });
      },

      // Check authentication status
      checkAuthStatus: async () => {
        const { token, refreshToken } = get();

        console.log('Store hydrated, checking auth status...');
        console.log('Has token:', !!token);
        console.log('Has refresh token:', !!refreshToken);

        if (!token) {
          console.log('No token found, user not authenticated');
          set({ isAuthenticated: false });
          return;
        }

        // Ensure apiClient has the tokens loaded in memory
        if (token && refreshToken) {
          try {
            await apiClient.setTokens(token, refreshToken);
          } catch (error) {
            console.warn('Failed to sync tokens with API client:', error);
          }
        }

        try {
          // Verify token with API
          const result = await authService.verifyToken();

          if (result.valid) {
            set({
              isAuthenticated: true,
              user: result.user || get().user
            });
          } else {
            throw new Error('Token invalid');
          }
        } catch (error) {
          console.log('Token verification failed, attempting refresh');

          // Try to refresh if we have a refresh token
          if (refreshToken) {
            const refreshed = await get().refreshAuth();
            if (!refreshed) {
              set({ isAuthenticated: false });
            }
          } else {
            set({ isAuthenticated: false });
          }
        }
      },

      // Verify OTP
      verifyOTP: async (phone: string, code: string, type: 'registration' | 'login' | 'password_reset' | 'phone_verification') => {
        set({ isLoading: true });

        try {
          const response = await authService.verifyOtp(phone, code, type);

          if (response.verified && response.tokens && response.user) {
            // Complete authentication after OTP verification
            set({
              user: response.user,
              token: response.tokens.accessToken,
              refreshToken: response.tokens.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              hasCompletedOnboarding: response.user.hasCompletedOnboarding,
              pendingRegistration: null // Clear pending registration
            });

            // Sync tokens with apiClient
            await apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken);

            // Register push notification token in the background (non-blocking)
            NotificationUtils.syncPushTokenWithAPI()
              .then(() => {
                console.log('✅ Push token synced after OTP verification');
              })
              .catch((error) => {
                console.error('⚠️ Failed to sync push token after OTP:', error);
                // Don't fail the verification if push token sync fails
              });
          } else {
            set({ isLoading: false });
          }

          return response.verified;
        } catch (error) {
          console.error('OTP verification error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      // Resend OTP
      resendOTP: async (phone: string, type: 'registration' | 'login' | 'password_reset' | 'phone_verification') => {
        try {
          const response = await authService.resendOtp(phone, type);
          return response.otpSent;
        } catch (error) {
          console.error('Resend OTP error:', error);
          return false;
        }
      },

      // Forgot password
      forgotPassword: async (phone: string) => {
        try {
          const response = await authService.forgotPassword(phone);
          return response.otpSent;
        } catch (error) {
          console.error('Forgot password error:', error);
          return false;
        }
      },

      // Reset password
      resetPassword: async (phone: string, code: string, newPassword: string) => {
        try {
          const response = await authService.resetPassword(phone, code, newPassword);
          return response.passwordReset;
        } catch (error) {
          console.error('Reset password error:', error);
          return false;
        }
      },

      // Change password
      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          const response = await authService.changePassword(currentPassword, newPassword);
          return response.success;
        } catch (error) {
          console.error('Change password error:', error);
          return false;
        }
      },

      // Set pending registration data
      setPendingRegistration: (data: { phone: string; userId: string } | null) => {
        set({ pendingRegistration: data });
      },

      // Clear all auth data
      clearAuth: async () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          hasCompletedOnboarding: false,
          pendingRegistration: null,
        });

        // Clear tokens from apiClient
        await apiClient.clearTokens();
      },
    }),
    {
      name: 'yu-card-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        pendingRegistration: state.pendingRegistration,
      }),
    }
  )
);