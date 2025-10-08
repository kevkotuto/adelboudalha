import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

export interface UpdateInfo {
  isUpdateAvailable: boolean;
  updateId?: string;
  manifest?: any;
  isDownloading?: boolean;
  isRollingBackToEmbedded?: boolean;
}

export class UpdateService {
  /**
   * Check if updates are enabled and we're not in development mode
   */
  private static canCheckForUpdates(): boolean {
    return __DEV__ === false && Updates.isEnabled;
  }

  /**
   * Check for available updates (manual check with user feedback)
   * @returns UpdateInfo object with availability status
   */
  static async checkForUpdate(): Promise<UpdateInfo> {
    if (!this.canCheckForUpdates()) {
      console.log('⚠️ Updates disabled in development mode or not configured');
      return { isUpdateAvailable: false };
    }

    try {
      console.log('🔍 Checking for updates...');
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log('✅ Update available:', update.manifest);
        return {
          isUpdateAvailable: true,
          updateId: update.manifest?.id,
          manifest: update.manifest,
        };
      } else {
        console.log('✅ App is up to date');
        return { isUpdateAvailable: false };
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      throw error;
    }
  }

  /**
   * Check for updates silently (for background checks on app startup)
   * @returns UpdateInfo object without throwing errors
   */
  static async checkForUpdateSilently(): Promise<UpdateInfo> {
    if (!this.canCheckForUpdates()) {
      return { isUpdateAvailable: false };
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      return {
        isUpdateAvailable: update.isAvailable,
        updateId: update.manifest?.id,
        manifest: update.manifest,
      };
    } catch (error) {
      console.warn('⚠️ Silent update check failed:', error);
      return { isUpdateAvailable: false };
    }
  }

  /**
   * Download and install available update
   * @returns Promise that resolves when update is downloaded
   */
  static async downloadAndInstallUpdate(): Promise<void> {
    if (!this.canCheckForUpdates()) {
      throw new Error('Updates are not enabled');
    }

    try {
      console.log('⬇️ Downloading update...');
      const fetchResult = await Updates.fetchUpdateAsync();

      if (fetchResult.isNew) {
        console.log('✅ Update downloaded successfully');
        console.log('🔄 Reloading app...');
        await Updates.reloadAsync();
      } else {
        console.log('ℹ️ No new update to install');
      }
    } catch (error) {
      console.error('❌ Error downloading/installing update:', error);
      throw error;
    }
  }

  /**
   * Get current update information
   * @returns Current update details
   */
  static getUpdateInfo(): {
    updateId: string | undefined;
    channel: string | undefined;
    runtimeVersion: string | undefined;
    isEmergencyLaunch: boolean;
    isEmbeddedLaunch: boolean;
  } {
    return {
      updateId: Updates.updateId,
      channel: Updates.channel,
      runtimeVersion: Updates.runtimeVersion,
      isEmergencyLaunch: Updates.isEmergencyLaunch,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
    };
  }

  /**
   * Get user-friendly update status message
   */
  static getStatusMessage(): string {
    if (__DEV__) {
      return 'Development mode - Updates disabled';
    }

    if (!Updates.isEnabled) {
      return 'Updates not configured';
    }

    if (Updates.isEmergencyLaunch) {
      return 'Emergency launch - Running embedded version';
    }

    if (Updates.isEmbeddedLaunch) {
      return 'Running embedded app version';
    }

    return 'Running latest update';
  }
}

export default UpdateService;
