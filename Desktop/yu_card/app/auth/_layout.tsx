import { Stack } from 'expo-router';
import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';

export default function AuthLayout() {
  return (
    <AuthGuard requireAuth={false}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        <Stack.Screen
          name="onboarding"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="verify-otp"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack>
    </AuthGuard>
  );
}