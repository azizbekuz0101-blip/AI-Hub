'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import ru from './ru.json';
import uz from './uz.json';

export type Language = 'ru' | 'uz' | 'en';
type Translations = typeof en;

const dictionaries: Record<Language, Translations> = { en, ru, uz };

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    // Read saved language preference or detect browser language
    const saved = localStorage.getItem('aihub_lang') as Language | null;
    if (saved && (saved === 'ru' || saved === 'uz' || saved === 'en')) {
      setLangState(saved);
    } else if (typeof navigator !== 'undefined') {
      const browserLang = (navigator.language || navigator.languages?.[0] || '').toLowerCase();
      if (browserLang.startsWith('ru')) {
        setLangState('ru');
      } else if (browserLang.startsWith('uz')) {
        setLangState('uz');
      } else {
        setLangState('en');
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('aihub_lang', newLang);
  };

  const t = (key: keyof Translations): string => {
    const dict = dictionaries[lang] || dictionaries.en;
    return dict[key] || dictionaries.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
