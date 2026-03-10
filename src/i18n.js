import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ps',
    supportedLngs: ['en', 'ps', 'dr'], // only allow these languages
    debug: false, // no debug logs in console
    interpolation: { escapeValue: false },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'], // try localStorage first, then browser
      caches: ['localStorage'], // store language in localStorage
      checkWhitelist: true, // ignore unsupported languages
    },
    react: { useSuspense: true },
  });

export default i18n;