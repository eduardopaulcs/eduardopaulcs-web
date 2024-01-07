import { useTranslation as useReactTranslation } from "react-i18next";

/**
 * Wrapper of the "react-i18next" useTranslation hook.
 */
const useTranslation = (ns: string | null = null) => {
  const [t, i18n] = useReactTranslation(ns || "common");
  const currentLang = i18n.language;
  const setLang = i18n.changeLanguage;

  return {t, currentLang, setLang};
};

export default useTranslation;
