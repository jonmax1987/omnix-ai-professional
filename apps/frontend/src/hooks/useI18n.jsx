import { useState, useEffect, createContext, useContext } from 'react';
import enTranslations from '../locales/en.json';
import heTranslations from '../locales/he.json';

const translations = {
  en: enTranslations,
  he: heTranslations
};

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('omnix-locale');
    return saved || 'en';
  });

  const [direction, setDirection] = useState(locale === 'he' ? 'rtl' : 'ltr');

  useEffect(() => {
    localStorage.setItem('omnix-locale', locale);
    const dir = locale === 'he' ? 'rtl' : 'ltr';
    setDirection(dir);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (!value) return key;
    
    return Object.keys(params).reduce((str, param) => {
      return str.replace(`{{${param}}}`, params[param]);
    }, value);
  };

  const changeLocale = (newLocale) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
    }
  };

  return (
    <I18nContext.Provider value={{ 
      locale, 
      direction, 
      t, 
      changeLocale,
      isRTL: locale === 'he'
    }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};