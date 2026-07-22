import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: "dr",
    fallbackLng: "dr",

    supportedLngs: ["en", "ps", "dr"],

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },

    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
    },

    react: {
      useSuspense: true,
    },

    debug: false,
  });

export default i18n;
