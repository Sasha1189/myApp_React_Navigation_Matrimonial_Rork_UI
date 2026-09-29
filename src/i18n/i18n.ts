import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { appStorage } from "../cacheMMKV/cacheConfig";
import en from "./locales/en/index";
import mr from "./locales/mr/index";

// Get stored language or default to English
const storedLanguage = appStorage.getString("user_language") || "mr";

const resources = {
  en: { translation: en },
  mr: { translation: mr },
};

i18n.use(initReactI18next).init({
  resources,
  lng: storedLanguage, // Initialize with stored language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React handles escaping already
  },
  compatibilityJSON: "v4",
});

export default i18n;
