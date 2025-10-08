import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useStoreHydration } from '@/hooks/useStoreHydration';
import { LoadingSpinner } from '@/components/ui/Layout/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding, checkAuthStatus } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const isHydrated = useStoreHydration();

  useEffect(() => {
    const initializeApp = async () => {
      if (!isHydrated) {
        console.log('Waiting for store hydration...');
        return;
      }

      try {
        console.log('Store hydrated, checking auth status...');
        // Check authentication status
        await checkAuthStatus();
      } catch (error) {
        console.error('Failed to check auth status:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [isHydrated, checkAuthStatus]);

  useEffect(() => {
    if (!isInitializing && isHydrated) {
      console.log('App initialization complete, deciding navigation...');

      if (isAuthenticated) {
        console.log('User authenticated, navigating to tabs...');
        router.replace('/(tabs)');
      } else {
        console.log('User not authenticated, checking onboarding status...');
        if (hasCompletedOnboarding) {
          console.log('Onboarding completed, navigating to login...');
          router.replace('/auth/login');
        } else {
          console.log('First time user, navigating to onboarding...');
          router.replace('/auth/onboarding');
        }
      }
    }
  }, [isInitializing, isHydrated, isAuthenticated, hasCompletedOnboarding]);

  return (
    <View style={{ flex: 1 }}>
      <LoadingSpinner variant="fullscreen" text="Initialisation..." />
    </View>
  );
}