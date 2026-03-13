import { useState } from "react";
import { Box, Button, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import useFunGames from "../hooks/useFunGames";
import relativeToAbsolutePath from "../utils/relativeToAbsolutePath";
import getEnvVariable from "../utils/getEnvVariable";
import { LANGUAGES } from "../constants";

/**
 * Individual game page.
 * Reads the :gameId URL param, finds the matching game, and renders it in an iframe.
 * Redirects to the fun list if the game is not found.
 * On desktop: floating back-nav (top-left) and lang switcher (top-right).
 * On mobile: single toggle button (top-left) that opens a panel with all controls.
 */
const FunGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, currentLang } = useTranslation();
  const { games, loading } = useFunGames();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [menuOpen, setMenuOpen] = useState(false);

  const game = games.find((g) => g === gameId) ?? null;

  useEffect(() => {
    if (!loading && game === null) {
      navigate(relativeToAbsolutePath("fun", currentLang), { replace: true });
    }
  }, [loading, game, navigate, currentLang]);

  if (loading || game === null) return null;

  const publicUrl = getEnvVariable("PUBLIC_URL", "", true);

  /**
   * Switches the site language preserving the current sub-path.
   */
  const handleLangSwitch = (lang: string) => {
    if (lang !== currentLang) {
      navigate(pathname.replace(`/${currentLang}`, `/${lang}`));
    }
    setMenuOpen(false);
  };

  const navButtonSx = {
    borderRadius: 0,
    "&:hover": { backgroundColor: "secondary.main" },
  };

  return (
    <>
      {isMobile ? (
        /* ── Mobile: single toggle button + collapsible panel ── */
        <Box sx={{ position: "fixed", top: 16, left: 16, zIndex: 2000 }}>
          <IconButton
            size="small"
            onClick={() => setMenuOpen((o) => !o)}
            sx={{
              borderRadius: 0,
              backgroundColor: "secondary.main",
              color: "#fff",
              width: 36,
              height: 36,
              fontSize: "1.1rem",
              "&:hover": { backgroundColor: "secondary.main" },
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </IconButton>
          {menuOpen && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => { navigate(relativeToAbsolutePath("/", currentLang)); setMenuOpen(false); }}
                sx={navButtonSx}
              >
                ← {t("navbar.goBack")}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => { navigate(relativeToAbsolutePath("fun", currentLang)); setMenuOpen(false); }}
                sx={navButtonSx}
              >
                ← {t("navbar.links.fun")}
              </Button>
              {LANGUAGES.length > 1 && LANGUAGES.map((lang) => (
                <Button
                  key={lang}
                  variant={lang === currentLang ? "contained" : "outlined"}
                  color="secondary"
                  size="small"
                  onClick={() => handleLangSwitch(lang)}
                  sx={{ borderRadius: 0, "&:hover": { backgroundColor: lang === currentLang ? "secondary.main" : "transparent" } }}
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        /* ── Desktop: back-nav top-left, lang switcher top-right ── */
        <>
          <Box
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 2000,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => navigate(relativeToAbsolutePath("/", currentLang))}
              sx={navButtonSx}
            >
              ← {t("navbar.goBack")}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => navigate(relativeToAbsolutePath("fun", currentLang))}
              sx={navButtonSx}
            >
              ← {t("navbar.links.fun")}
            </Button>
          </Box>
          {LANGUAGES.length > 1 && (
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
                  variant={lang === currentLang ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleLangSwitch(lang)}
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
        </>
      )}
      <iframe
        src={`${publicUrl}/fun/games/${game}/index.html?lang=${currentLang}`}
        title={t(`pages.fun.games.${game}.name`)}
        style={{ display: "block", width: "100%", height: "100vh", border: "none" }}
      />
    </>
  );
};

export default FunGame;
