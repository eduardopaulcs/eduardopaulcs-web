import translator from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANG, LANGUAGES } from "../constants";

import common_en from "./en/common.json";
import common_es from "./es/common.json";

/**
 * Determines the correct initial language before i18next initializes,
 * avoiding a flash from the default language to the URL's language.
 * Priority: URL pathname → browser language → DEFAULT_LANG.
 */
const getInitialLang = (): string => {
  const pathMatch = window.location.pathname.match(/^\/([^/]+)/);
  if (pathMatch && LANGUAGES.includes(pathMatch[1])) {
    return pathMatch[1];
  }
  const browserMatch = navigator.language.match(/^([\w]{2})(?:-[\w]{2})?$/);
  if (browserMatch && LANGUAGES.includes(browserMatch[1].toLowerCase())) {
    return browserMatch[1].toLowerCase();
  }
  return DEFAULT_LANG;
};

translator
  .use(initReactI18next)
  .init({
    lng: getInitialLang(),
    fallbackLng: DEFAULT_LANG,
    supportedLngs: LANGUAGES,
    load: "languageOnly",
    resources: {
      en: {
        common: common_en,
      },
      es: {
        common: common_es,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default translator;
