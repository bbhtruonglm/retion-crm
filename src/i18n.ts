import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { translation as translationVi } from "./locales/vi/translation";
import { translation as translationEn } from "./locales/en/translation";

/**
 * Lấy locale từ URL query parameter
 * @returns {string} - Locale code (vi hoặc en)
 */
const GetLocaleFromUrl = (): string => {
  /** URL params */
  const PARAMS = new URLSearchParams(window.location.search);
  /** Locale từ URL */
  const LOCALE_FROM_URL = PARAMS.get("locale");

  if (LOCALE_FROM_URL && ["vi", "en"].includes(LOCALE_FROM_URL)) {
    /** Lưu vào localStorage */
    localStorage.setItem("i18nextLng", LOCALE_FROM_URL);
    return LOCALE_FROM_URL;
  }

  /** Lấy từ localStorage */
  const LOCALE_FROM_STORAGE = localStorage.getItem("i18nextLng");
  if (LOCALE_FROM_STORAGE && ["vi", "en"].includes(LOCALE_FROM_STORAGE)) {
    return LOCALE_FROM_STORAGE;
  }

  /** Mặc định là tiếng Việt */
  return "vi";
};

/** Locale hiện tại */
const CURRENT_LOCALE = GetLocaleFromUrl();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: translationVi },
      en: { translation: translationEn },
    },
    lng: CURRENT_LOCALE, // Sử dụng locale từ URL hoặc localStorage
    fallbackLng: "vi",
    debug: false, // Tắt debug trong production
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      lookupQuerystring: "locale",
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
  });

export default i18n;
