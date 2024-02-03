import { useEffect, useState } from "react";
import Content from "./Content";
import { Box } from "@mui/material";
import { Navigate } from "react-router-dom";
import { LANGUAGES } from "../../constants";
import Navbar from "./Navbar";
import useLocationPath from "../../hooks/useLocationPath";
import useLangParam from "../../hooks/useLangParam";
import useTranslation from "../../hooks/useTranslation";
import Footer from "./Footer";

const validateLocationPathAndLangParam = (locationPath: string, langParam: string | null) => {
  const isLangParamValid = !!(langParam && LANGUAGES.includes(langParam));
  const isLocationPathValid = !(locationPath === "/");

  return {isLocationPathValid, isLangParamValid};
};

/**
 * Site layout component.
 */
const Layout = () => {
  const locationPath = useLocationPath(true);
  const langParam = useLangParam();
  const {t, currentLang, setLang} = useTranslation();

  const {
    isLocationPathValid: locationPathValid,
    isLangParamValid: langParamValid,
  } = validateLocationPathAndLangParam(locationPath, langParam);
  const [isLocationPathValid, setIsLocationPathValid] = useState<boolean>(locationPathValid);
  const [isLangParamValid, setIsLangParamValid] = useState<boolean>(langParamValid);

  useEffect(() => {
    // When the language parameter changes

    // Validate location and language
    const {
      isLocationPathValid,
      isLangParamValid,
    } = validateLocationPathAndLangParam(locationPath, langParam);

    setIsLocationPathValid(isLocationPathValid);
    setIsLangParamValid(isLangParamValid);

    // HACK!! Compiler doesn't care we just validated this variable, so we
    //        have to cast it to undefined, this will never be undefined
    const newLang = langParam || undefined;
    if (
      // If the new language is valid
      isLangParamValid &&
      // And if the language actually changed
      currentLang !== newLang
    ) {
      // Notify translator of change
      setLang(newLang);

      document.documentElement.lang = t("seo.lang");
      document.title = t("seo.title");
      document.querySelector("meta[name='description']")?.setAttribute("content", t("seo.description"));
    }
  }, [locationPath, langParam, t, currentLang, setLang]);

  const renderContent = () => {
    // If we should redirect the user to the default language home page
    // ToDo: Handle 404 page, don't redirect to home page if the user tries
    //       "/test", because right now we are assuming the user tried the
    //       "test" language, but that doesn't make sense
    if (!isLocationPathValid || (langParam !== null && !isLangParamValid)) {
      // Get browser language
      const browserLangMatch = navigator.language.match(/^([\w]{2})(?:-[\w]{2})?$/);
      const browserLang = (browserLangMatch !== null && browserLangMatch.length === 2)
        ? browserLangMatch[1].toLowerCase()
        : null;

      // Default to current language
      let redirectLang = currentLang;

      // If we have a valid browser language
      if (
        browserLang &&
        browserLang !== redirectLang &&
        LANGUAGES.includes(browserLang)
      ) {
        // Default to that
        redirectLang = browserLang;
      }

      return (
        <Navigate to={`/${redirectLang}`} replace />
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Navbar />
        <Content />
        <Footer />
      </Box>
    );
  };

  return (
    <>
      {renderContent()}
    </>
  );
};

export default Layout;
