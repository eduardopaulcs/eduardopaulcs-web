import translator from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANG, LANGUAGES } from "../constants";

import common_en from "./en/common.json";
import common_es from "./es/common.json";

translator
  .use(initReactI18next)
  .init({
    lng: DEFAULT_LANG,
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
