import { useEffect, useState } from "react";
import Content from "./Content";
import { Box, Button } from "@mui/material";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LANGUAGES, SITE_SECTIONS } from "../../constants";
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
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const locationPath = useLocationPath(true);
  const langParam = useLangParam();

  // The landing page has only one path segment (the lang), e.g. "/en/"
  const pathSegments = pathname.split("/").filter(Boolean);
  const isLandingPage = pathSegments.length <= 1;
  // Game pages (/:lang/fun/:gameId) have their own full-screen layout — no Navbar or Footer
  const isGamePage = pathSegments.length >= 3 && pathSegments[1] === SITE_SECTIONS.fun;
  const showNavbar = !isLandingPage && !isGamePage;
  const {t, currentLang, setLang} = useTranslation();

  /**
   * Switches the site language, preserving the current sub-path.
   */
  const handleLangSwitch = (lang: string) => {
    if (lang !== currentLang) {
      const newPath = pathname.replace(`/${currentLang}`, `/${lang}`);
      navigate(newPath, { replace: true });
    }
  };

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
    if (isLangParamValid) {
      // Notify translator of change only when the language actually changed
      if (currentLang !== newLang) {
        setLang(newLang);
      }

      // Always keep SEO metadata in sync with the current language
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
          minHeight: "100vh",
        }}
      >
        {LANGUAGES.length > 1 && !isGamePage && (
          <Box
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 2000,
              display: "flex",
              gap: 1,
            }}
          >
            {LANGUAGES.map((lang) => (
              <Button
                key={lang}
                onClick={() => handleLangSwitch(lang)}
                variant={lang === currentLang ? "contained" : "outlined"}
                size="small"
                sx={{
                  borderRadius: 0,
                  minWidth: 48,
                  "&:hover": { backgroundColor: lang === currentLang ? "primary.main" : "transparent" },
                }}
              >
                {lang.toUpperCase()}
              </Button>
            ))}
          </Box>
        )}
        {showNavbar && <Navbar />}
        <Content hasNavbar={showNavbar} disableContainer={isGamePage} />
        {!isGamePage && <Footer />}
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
