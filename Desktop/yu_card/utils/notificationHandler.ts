import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

/**
 * Notification data structure from backend
 */
export interface NotificationData {
  type?: 'product' | 'order' | 'promotion' | 'general';
  productId?: string;
  orderId?: string;
  url?: string;
  screen?: string;
}

/**
 * Handle notification tap/click
 * Routes user to appropriate screen based on notification data
 */
export const handleNotificationResponse = (
  response: Notifications.NotificationResponse
): void => {
  try {
    const data = response.notification.request.content.data as NotificationData;

    console.log('📱 Notification tapped:', data);

    // Handle different notification types
    switch (data.type) {
      case 'product':
        if (data.productId) {
          console.log('➡️ Navigating to product:', data.productId);
          router.push(`/${data.productId}`);
        }
        break;

      case 'order':
        if (data.orderId) {
          console.log('➡️ Navigating to order:', data.orderId);
          router.push(`/orders/${data.orderId}`);
        } else {
          // Navigate to orders list
          router.push('/(tabs)/orders');
        }
        break;

      case 'promotion':
        // Navigate to promotions/explore
        console.log('➡️ Navigating to promotions');
        router.push('/(tabs)/explore');
        break;

      case 'general':
      default:
        // Check for custom URL or screen
        if (data.url) {
          console.log('➡️ Opening custom URL:', data.url);
          // Handle custom deep link
          handleDeepLink(data.url);
        } else if (data.screen) {
          console.log('➡️ Navigating to screen:', data.screen);
          router.push(data.screen as any);
        } else {
          // Default: navigate to home
          console.log('➡️ No specific target, navigating to home');
          router.push('/(tabs)/');
        }
        break;
    }
  } catch (error) {
    console.error('❌ Error handling notification response:', error);
    // Fallback: navigate to home
    router.push('/(tabs)/');
  }
};

/**
 * Handle deep links from notifications
 * Supports both custom scheme (yucard://) and universal links (https://app.yucard.generale-ci.com)
 */
export const handleDeepLink = (url: string): void => {
  try {
    console.log('🔗 Handling deep link:', url);

    // Parse URL
    const parsedUrl = new URL(url);

    // Extract path
    let path = parsedUrl.pathname;

    // Handle custom scheme (yucard://product/123)
    if (parsedUrl.protocol === 'yucard:') {
      path = parsedUrl.host + parsedUrl.pathname;
    }

    // Handle universal link (https://app.yucard.generale-ci.com/product/123)
    // Remove leading slash for expo-router
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    console.log('➡️ Navigating to path:', path);

    // Navigate to the extracted path
    if (path) {
      router.push(path as any);
    } else {
      router.push('/(tabs)/');
    }
  } catch (error) {
    console.error('❌ Error parsing deep link:', error);

    // Fallback: try to extract product ID from simple format
    const productIdMatch = url.match(/\/product\/([a-zA-Z0-9-]+)/);
    if (productIdMatch && productIdMatch[1]) {
      router.push(`/${productIdMatch[1]}`);
    } else {
      router.push('/(tabs)/');
    }
  }
};

/**
 * Configure notification behavior
 * Sets how notifications are handled when app is in foreground
 */
export const configureNotifications = (): void => {
  // Set notification handler for foreground notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  console.log('✅ Notification handler configured');
};

/**
 * Setup notification listener
 * Returns cleanup function to remove listener
 */
export const setupNotificationListener = (): (() => void) => {
  // Listen for notification responses (user taps notification)
  const subscription = Notifications.addNotificationResponseReceivedListener(
    handleNotificationResponse
  );

  console.log('✅ Notification listener setup');

  // Return cleanup function
  return () => {
    subscription.remove();
    console.log('🧹 Notification listener removed');
  };
};

/**
 * Handle received notification (when app is open)
 * Optional: Add custom behavior for foreground notifications
 */
export const setupForegroundNotificationListener = (): (() => void) => {
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('📬 Notification received (foreground):', notification);
      // You can add custom logic here, like showing an in-app notification
    }
  );

  console.log('✅ Foreground notification listener setup');

  return () => {
    subscription.remove();
    console.log('🧹 Foreground notification listener removed');
  };
};
