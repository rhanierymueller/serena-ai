import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import translations from '.';

type Language = 'pt' | 'en' | 'es';

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextProps>({
  language: 'pt',
  setLanguage: () => {},
  t: () => '',
});

const getDefaultLanguage = (): Language => {
  const saved = localStorage.getItem('language') as Language | null;
  if (saved) return saved;

  const browserLang = navigator.language.slice(0, 2);
  if (['pt', 'en', 'es'].includes(browserLang)) {
    return browserLang as Language;
  }

  return 'pt';
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getDefaultLanguage);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (path: string) => {
    const keys = path.split('.');
    let result: any = translations[language];
    for (const key of keys) {
      if (result && key in result) {
        result = result[key];
      } else {
        return path;
      }
    }
    return typeof result === 'string' ? result : path;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
