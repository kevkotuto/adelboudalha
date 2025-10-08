import { SUPPORTED_LANGUAGES } from '@/utils/constants';
import { deviceLanguageManager } from '@/utils/deviceLanguage';
import { I18n } from 'i18n-js';

// Import translations
import ar from './translations/ar.json';
import bm from './translations/bm.json';
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

// Create the i18n instance
export const i18n = new I18n({
  fr,
  en,
  ar,
  es,
  bm,
});

// Set the locale once at the beginning of your app.
i18n.enableFallback = true;
i18n.defaultLocale = SUPPORTED_LANGUAGES.FR;

// Initialize locale
const initializeLocale = () => {
  try {
    // Get current language from device manager
    if (deviceLanguageManager?.getCurrentLanguage) {
      const currentLanguage = deviceLanguageManager.getCurrentLanguage();
      i18n.locale = currentLanguage;
    } else {
      i18n.locale = SUPPORTED_LANGUAGES.FR;
    }
  } catch (error) {
    i18n.locale = SUPPORTED_LANGUAGES.FR;
  }
};

// Set locale dynamically
export const setLocale = (locale: string) => {
  if (Object.values(SUPPORTED_LANGUAGES).includes(locale as any)) {
    i18n.locale = locale;
    if (deviceLanguageManager?.setLanguage) {
      deviceLanguageManager.setLanguage(locale).catch(error => {
      });
    }
  }
};

// Get current locale
export const getCurrentLocale = () => {
  try {
    return i18n?.locale || SUPPORTED_LANGUAGES.FR;
  } catch (error) {
    return SUPPORTED_LANGUAGES.FR;
  }
};

// Translation function
export const t = (key: string, options?: any) => {
  try {
    return i18n?.t ? i18n.t(key, options) : key;
  } catch (error) {
    return key;
  }
};

// Check if locale is RTL (Right-to-Left)
export const isRTL = (locale?: string) => {
  const currentLocale = locale || getCurrentLocale();
  return currentLocale === SUPPORTED_LANGUAGES.AR;
};

// Initialize immediately on import
initializeLocale();

export default i18n;