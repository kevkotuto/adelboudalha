import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from '@/components/ui/Layout/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true
}) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const {
    isAuthenticated,
    hasCompletedOnboarding,
    checkAuthStatus,
    token
  } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication status from storage
        await checkAuthStatus();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!isCheckingAuth) {
      console.log('AuthGuard navigation check:', {
        requireAuth,
        isAuthenticated,
        hasCompletedOnboarding,
        isCheckingAuth
      });

      if (requireAuth && !isAuthenticated) {
        // Redirect to login if authentication is required but user is not authenticated
        if (!hasCompletedOnboarding) {
          console.log('Redirecting to onboarding');
          router.replace('/auth/onboarding');
        } else {
          console.log('Redirecting to login (from protected route)');
          router.replace('/auth/login');
        }
      } else if (!requireAuth && isAuthenticated) {
        // Redirect to main app if user is authenticated but trying to access auth screens
        console.log('Redirecting to tabs (user authenticated)');
        router.replace('/(tabs)');
      }
      // Removed the automatic redirect to login for onboarding completed users
      // This allows navigation to intermediate auth screens like verify-otp
    }
  }, [isCheckingAuth, isAuthenticated, requireAuth, hasCompletedOnboarding]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingSpinner
          variant="fullscreen"
          text="Chargement..."
        />
      </View>
    );
  }

  // Show children if auth requirements are met
  if ((requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated)) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <View style={{ flex: 1 }}>
      <LoadingSpinner
        variant="fullscreen"
        text="Redirection..."
      />
    </View>
  );
};