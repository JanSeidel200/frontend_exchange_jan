import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { cs } from "./locales/cs";
import { en } from "./locales/en";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      cs: { translation: cs },
      en: { translation: en },
    },
    fallbackLng: "cs",
    supportedLngs: ["cs", "en"],
    detection: {
      order: ["cookie", "localStorage", "navigator"],
      caches: ["cookie"],
      lookupCookie: "ui_language",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;