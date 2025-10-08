import { useContext } from 'react';
import { LanguageContext } from '@/context/LanguageContext';

// Default hook that safely handles missing context
const useTranslation = () => {
  const context = useContext(LanguageContext);

  // Return a fallback if context is not available
  if (!context) {
    console.warn('LanguageContext not available, using fallback translation');
    return {
      t: (key: string) => key,
      currentLocale: 'fr',
      isRtl: false,
      changeLanguage: async () => false,
      getSupportedLanguages: () => ['fr'],
      getLanguageName: (code: string) => code,
      isChangingLanguage: false,
      i18n: null
    };
  }

  return context;
};

export default useTranslation;
export { useTranslation };