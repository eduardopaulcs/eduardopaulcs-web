import { useLocation, useNavigate } from "react-router-dom";
import useTranslation from "./useTranslation";

/**
 * Provides a handler for switching the site language while preserving the
 * current sub-path.
 */
const useLangSwitch = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentLang } = useTranslation();

  /**
   * Switches the site language, preserving the current sub-path.
   */
  const handleLangSwitch = (lang: string) => {
    if (lang !== currentLang) {
      const newPath = pathname.replace(`/${currentLang}`, `/${lang}`);
      navigate(newPath, { replace: true });
    }
  };

  return { handleLangSwitch, currentLang };
};

export default useLangSwitch;
