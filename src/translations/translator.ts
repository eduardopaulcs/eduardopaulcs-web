import translator from "i18next";
import type { Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANG, LANGUAGES } from "../constants";

// Dynamically loads all common.json files from src/translations/{lang}/ subdirectories.
// Adding a new language only requires creating the translation folder — no changes here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translationContext = (require as any).context("./", true, /common\.json$/);
const resources: Resource = {};
(translationContext.keys() as string[]).forEach((key) => {
  const match = key.match(/\.\/([\w-]+)\/common\.json$/);
  if (match) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resources[match[1]] = { common: translationContext(key) as any };
  }
});

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
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default translator;
