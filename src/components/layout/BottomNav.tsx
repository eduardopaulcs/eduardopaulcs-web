import { useState, useRef } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from "@mui/icons-material/Article";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LanguageIcon from "@mui/icons-material/Language";
import { useLocation, useNavigate } from "react-router-dom";
import useTranslation from "../../hooks/useTranslation";
import useLangSwitch from "../../hooks/useLangSwitch";
import relativeToAbsolutePath from "../../utils/relativeToAbsolutePath";
import { LANGUAGES, SITE_SECTIONS } from "../../constants";

/**
 * Derives the active bottom nav tab index from the current pathname.
 * Returns -1 if no primary tab is active (e.g. landing).
 */
const getActiveTab = (pathname: string): number => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.includes(SITE_SECTIONS.me)) return 1;
  if (parts.includes(SITE_SECTIONS.blog)) return 2;
  if (parts.includes(SITE_SECTIONS.fun)) return 3;
  return 0;
};

/**
 * Mobile-only bottom navigation bar. Renders null on desktop (sm+).
 * Provides site-level navigation and a language switcher.
 */
const BottomNav = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, currentLang } = useTranslation();
  const { handleLangSwitch } = useLangSwitch();

  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);
  const langButtonRef = useRef<HTMLButtonElement>(null);

  if (!isMobile) return null;

  const activeTab = getActiveTab(pathname);

  /**
   * Navigates to a site section using the current language prefix.
   */
  const handleNavAction = (section: string) => {
    navigate(relativeToAbsolutePath(section, currentLang));
  };

  /**
   * Navigates to the landing page.
   */
  const handleGoHome = () => {
    navigate(relativeToAbsolutePath("/", currentLang), { replace: false });
  };

  /**
   * Opens the language switcher menu.
   */
  const handleLangButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLangMenuAnchor(event.currentTarget);
  };

  /**
   * Closes the language switcher menu.
   */
  const handleLangMenuClose = () => {
    setLangMenuAnchor(null);
  };

  /**
   * Switches language and closes the menu.
   */
  const handleLangSelect = (lang: string) => {
    handleLangSwitch(lang);
    handleLangMenuClose();
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
        }}
      >
        <BottomNavigation value={activeTab}>
          <BottomNavigationAction
            aria-label={t("navbar.goBack")}
            icon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{ minWidth: 0 }}
          />
          <BottomNavigationAction
            aria-label={t("navbar.links.me")}
            icon={<PersonIcon />}
            onClick={() => handleNavAction(SITE_SECTIONS.me)}
            sx={{ minWidth: 0 }}
          />
          <BottomNavigationAction
            aria-label={t("navbar.links.blog")}
            icon={<ArticleIcon />}
            onClick={() => handleNavAction(SITE_SECTIONS.blog)}
            sx={{ minWidth: 0 }}
          />
          <BottomNavigationAction
            aria-label={t("navbar.links.fun")}
            icon={<SportsEsportsIcon />}
            onClick={() => handleNavAction(SITE_SECTIONS.fun)}
            sx={{ minWidth: 0 }}
          />
          <BottomNavigationAction
            ref={langButtonRef}
            aria-label={t("navbar.changeLanguage")}
            icon={<LanguageIcon />}
            onClick={handleLangButtonClick}
            sx={{ minWidth: 0 }}
          />
        </BottomNavigation>
      </Paper>

      <Menu
        anchorEl={langMenuAnchor}
        open={Boolean(langMenuAnchor)}
        onClose={handleLangMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang}
            onClick={() => handleLangSelect(lang)}
            selected={lang === currentLang}
            sx={{
              fontWeight: lang === currentLang ? "bold" : "normal",
            }}
          >
            {lang.toUpperCase()}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default BottomNav;
