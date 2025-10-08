import { getLocales } from 'expo-localization';
import { storage } from './storage';
import { STORAGE_KEYS, SUPPORTED_LANGUAGES } from './constants';

export class DeviceLanguageManager {
  private currentLanguage: string = SUPPORTED_LANGUAGES.FR;

  constructor() {
    // Initialize with default language first
    this.currentLanguage = SUPPORTED_LANGUAGES.FR;
    // Then initialize asynchronously
    this.initializeLanguage();
  }

  private async initializeLanguage() {
    try {
      // Check if user has manually set a language
      const storedLanguage = await storage.getString(STORAGE_KEYS.DEVICE_LANGUAGE);
      
      if (storedLanguage && this.isLanguageSupported(storedLanguage)) {
        this.currentLanguage = storedLanguage;
        return;
      }

      // Detect device language
      const deviceLanguage = this.detectDeviceLanguage();
      this.currentLanguage = deviceLanguage;
      await storage.setString(STORAGE_KEYS.DEVICE_LANGUAGE, deviceLanguage);
    } catch (error) {
      // Fallback to default language
      this.currentLanguage = SUPPORTED_LANGUAGES.FR;
    }
  }

  detectDeviceLanguage(): string {
    try {
      const locales = getLocales();
      
      if (locales && locales.length > 0) {
        // Check primary locale first
        const primaryLocale = locales[0];
        const primaryLanguageCode = primaryLocale.languageCode.toLowerCase();
        
        // Check if primary language is supported
        if (this.isLanguageSupported(primaryLanguageCode)) {
          return primaryLanguageCode;
        }

        // Check all locales for supported languages
        for (const locale of locales) {
          const languageCode = locale.languageCode.toLowerCase();
          if (this.isLanguageSupported(languageCode)) {
            return languageCode;
          }
        }
      }
    } catch (error) {
    }

    // Default to French
    return SUPPORTED_LANGUAGES.FR;
  }

  isLanguageSupported(languageCode: string): boolean {
    return Object.values(SUPPORTED_LANGUAGES).includes(languageCode as any);
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  async setLanguage(languageCode: string): Promise<boolean> {
    if (!this.isLanguageSupported(languageCode)) {
      return false;
    }

    this.currentLanguage = languageCode;
    await storage.setString(STORAGE_KEYS.DEVICE_LANGUAGE, languageCode);
    return true;
  }

  getSupportedLanguages(): string[] {
    return Object.values(SUPPORTED_LANGUAGES);
  }

  getLanguageName(languageCode: string): string {
    const languageNames: Record<string, string> = {
      [SUPPORTED_LANGUAGES.FR]: 'Français',
      [SUPPORTED_LANGUAGES.EN]: 'English',
      [SUPPORTED_LANGUAGES.AR]: 'العربية',
      [SUPPORTED_LANGUAGES.ES]: 'Español',
      [SUPPORTED_LANGUAGES.BM]: 'Bamanankan',
    };

    return languageNames[languageCode] || languageCode;
  }

  getDeviceLocales() {
    try {
      return getLocales();
    } catch (error) {
      return [];
    }
  }
}

export const deviceLanguageManager = new DeviceLanguageManager();