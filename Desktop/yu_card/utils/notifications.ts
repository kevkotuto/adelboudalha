import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import userService from '../services/userService';

const PUSH_TOKEN_KEY = 'pushToken';

export interface PushTokenData {
  token: string;
  timestamp: number;
}

export const NotificationUtils = {
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  async getPushToken(): Promise<string | null> {
    try {
      if (!await this.requestPermissions()) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync();

      return token.data;
    } catch (error) {
      return null;
    }
  },

  async storePushTokenLocally(token: string): Promise<void> {
    try {
      const tokenData: PushTokenData = {
        token,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, JSON.stringify(tokenData));
    } catch (error) {
    }
  },

  async getStoredPushToken(): Promise<string | null> {
    try {
      const stored = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (!stored) return null;

      const tokenData: PushTokenData = JSON.parse(stored);
      return tokenData.token;
    } catch (error) {
      return null;
    }
  },

  async clearStoredPushToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    } catch (error) {
    }
  },

  async requestAndStorePushToken(): Promise<string | null> {
    try {
      const token = await this.getPushToken();
      if (token) {
        await this.storePushTokenLocally(token);
      }
      return token;
    } catch (error) {
      return null;
    }
  },

  async syncPushTokenWithAPI(): Promise<boolean> {
    try {
      const storedToken = await this.getStoredPushToken();
      if (!storedToken) {
        return false;
      }

      await userService.updatePushToken(storedToken);
      return true;
    } catch (error) {
      return false;
    }
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const initializePushNotifications = async (): Promise<void> => {
  try {
    
    // Request permissions and get token
    const token = await NotificationUtils.requestAndStorePushToken();
    
    if (token) {
      
      // Sync with API
      await NotificationUtils.syncPushTokenWithAPI();
    } else {
    }
  } catch (error) {
  }
};