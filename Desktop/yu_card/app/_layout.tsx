import { Colors } from '@/constants';
import { LanguageProvider } from '@/context/LanguageContext';
import {
  Ubuntu_300Light,
  Ubuntu_400Regular,
  Ubuntu_500Medium,
  Ubuntu_700Bold,
  useFonts
} from "@expo-google-fonts/ubuntu";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast } from 'react-native-toast-message';
import { CartToast } from '@/components/ui/Toast';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NotificationUtils } from '@/utils/notifications';
import { UpdateService, UpdateInfo } from '@/services/updateService';
import { UpdateModal } from '@/components/UpdateModal';
import {
  configureNotifications,
  setupNotificationListener,
  setupForegroundNotificationListener,
} from '@/utils/notificationHandler';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [fontLoaded, fontError] = useFonts({
    Ubuntu_300Light,
    Ubuntu_400Regular,
    Ubuntu_500Medium,
    Ubuntu_700Bold,
  });

  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  useEffect(() => {
    if (fontLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, fontError]);

  // Request push notification permissions and setup handlers on app startup
  useEffect(() => {
    // Configure notification behavior
    configureNotifications();

    // Setup notification listeners
    const cleanupResponseListener = setupNotificationListener();
    const cleanupForegroundListener = setupForegroundNotificationListener();

    // Request permissions in the background, don't block app loading
    NotificationUtils.requestPermissions()
      .then((granted) => {
        if (granted) {
          console.log('✅ Push notification permission granted');
        } else {
          console.log('⚠️ Push notification permission denied');
        }
      })
      .catch((error) => {
        console.error('❌ Error requesting notification permission:', error);
      });

    // Cleanup on unmount
    return () => {
      cleanupResponseListener();
      cleanupForegroundListener();
    };
  }, []);

  // Check for updates on app startup
  useEffect(() => {
    // Check for updates in the background after fonts load
    if (fontLoaded || fontError) {
      UpdateService.checkForUpdate()
        .then((info) => {
          if (info.isUpdateAvailable) {
            console.log('✅ Update available:', info.updateId);
            setUpdateInfo(info);
            setIsUpdateModalVisible(true);
          } else {
            console.log('✅ App is up to date');
          }
        })
        .catch((error) => {
          console.error('❌ Error checking for updates:', error);
        });
    }
  }, [fontLoaded, fontError]);

  if (!fontLoaded && !fontError) {
    return null;
  }

  // Custom toast configuration
  const toastConfig = {
    cartToast: (props: any) => <CartToast {...props} />,
  };

  const handleUpdate = async () => {
    try {
      await UpdateService.downloadAndInstallUpdate();
    } catch (error) {
      console.error('❌ Error downloading update:', error);
      setIsUpdateModalVisible(false);
    }
  };

  const handleUpdateLater = () => {
    setIsUpdateModalVisible(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <LanguageProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: Colors.background.primary,
                },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(admintabs)" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="search" options={{  }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen
                name="admin/product-form"
                options={{
                  presentation: 'modal',
                  headerShown: false,
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
            <StatusBar style="auto" />
            <Toast config={toastConfig} />

            {/* Update Modal */}
            {updateInfo && (
              <UpdateModal
                visible={isUpdateModalVisible}
                updateInfo={updateInfo}
                onUpdate={handleUpdate}
                onClose={handleUpdateLater}
              />
            )}
          </LanguageProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
