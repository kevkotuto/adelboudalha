import { getCurrentLocale, i18n, isRTL, setLocale } from '@/i18n';
import { SUPPORTED_LANGUAGES } from '@/utils/constants';
import { deviceLanguageManager } from '@/utils/deviceLanguage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// Types
interface LanguageContextType {
  currentLocale: string;
  isRtl: boolean;
  changeLanguage: (locale: string) => Promise<boolean>;
  getSupportedLanguages: () => string[];
  getLanguageName: (languageCode: string) => string;
  t: (key: string, options?: any) => string;
  i18n: typeof i18n;
  isChangingLanguage: boolean;
}

// Context - exported for use in the hook
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Custom hook
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// Provider Props
interface LanguageProviderProps {
  children: ReactNode;
}

// Event emitter pour notifier les changements de langue
class LanguageEventEmitter {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  emit() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.warn('Error in language change listener:', error);
      }
    });
  }
}

const languageEmitter = new LanguageEventEmitter();

// Provider Component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState(() => {
    try {
      return getCurrentLocale();
    } catch (error) {
      return SUPPORTED_LANGUAGES.FR;
    }
  });

  const [isRtl, setIsRtl] = useState(() => {
    try {
      return isRTL();
    } catch (error) {
      return false;
    }
  });

  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [, forceUpdate] = useState({});

  // Translation function
  const t = useCallback((key: string, options?: any) => {
    try {
      if (!i18n?.t) {
        console.warn('i18n not ready, returning key:', key);
        return key;
      }
      return i18n.t(key, options);
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return key;
    }
  }, [currentLocale]); // Re-create when locale changes

  // Change language function
  const changeLanguage = useCallback(async (locale: string): Promise<boolean> => {
    if (!Object.values(SUPPORTED_LANGUAGES).includes(locale as any)) {
      return false;
    }

    if (locale === currentLocale) {
      return true; // Already the current language
    }

    setIsChangingLanguage(true);

    try {
      // Update i18n locale
      setLocale(locale);
      
      // Update device language manager
      await deviceLanguageManager.setLanguage(locale);
      
      // Update settings store if available
      try {
        const { useSettingsStore } = await import('@/src/stores/settingsStore');
        const settingsStore = useSettingsStore.getState();
        if (settingsStore.updateSetting) {
          await settingsStore.updateSetting('language', locale);
        }
      } catch (error) {
        console.warn('Settings store not available during language change:', error);
      }
      
      // Update local state
      setCurrentLocale(locale);
      setIsRtl(isRTL(locale));
      
      // Force re-render
      forceUpdate({});
      
      // Notify all subscribers
      languageEmitter.emit();
      
      // Small delay to ensure all components have updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsChangingLanguage(false);
      return true;
    } catch (error) {
      console.error('Error changing language:', error);
      setIsChangingLanguage(false);
      return false;
    }
  }, [currentLocale]);

  // Get supported languages
  const getSupportedLanguages = useCallback(() => {
    try {
      return deviceLanguageManager?.getSupportedLanguages ? 
        deviceLanguageManager.getSupportedLanguages() : 
        Object.values(SUPPORTED_LANGUAGES);
    } catch (error) {
      return Object.values(SUPPORTED_LANGUAGES);
    }
  }, []);

  // Get language name
  const getLanguageName = useCallback((languageCode: string) => {
    try {
      return deviceLanguageManager?.getLanguageName ? 
        deviceLanguageManager.getLanguageName(languageCode) : 
        languageCode;
    } catch (error) {
      return languageCode;
    }
  }, []);

  // Initialize and listen for external language changes
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        if (deviceLanguageManager?.getCurrentLanguage) {
          const currentLang = deviceLanguageManager.getCurrentLanguage();
          if (currentLang !== currentLocale) {
            setCurrentLocale(currentLang);
            setIsRtl(isRTL(currentLang));
            if (i18n) {
              i18n.locale = currentLang;
            }
            forceUpdate({});
          }
        }
      } catch (error) {
        console.warn('Error initializing language:', error);
      }
    };

    // Initialize immediately
    initializeLanguage();

    // Set up interval to check for external changes
    const interval = setInterval(initializeLanguage, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [currentLocale]);

  // Subscribe to language change events
  useEffect(() => {
    const unsubscribe = languageEmitter.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  const contextValue: LanguageContextType = {
    currentLocale,
    isRtl,
    changeLanguage,
    getSupportedLanguages,
    getLanguageName,
    t,
    i18n,
    isChangingLanguage,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default useTranslation;