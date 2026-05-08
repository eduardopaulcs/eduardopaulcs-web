import { useEffect, useRef, useState } from "react";
import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Background from "../components/pages/Portfolio/Background";
import Face from "../images/portfolio/face.png";
import Blob from "../images/portfolio/blob.png";
import Lines from "../images/portfolio/lines.png";
import useTranslation from "../hooks/useTranslation";
import { SITE_SECTIONS } from "../constants";
import { mapSiteSectionKeyToIcon } from "../utils/siteSectionMappers";
import relativeToAbsolutePath from "../utils/relativeToAbsolutePath";

/**
 * Landing page of the site. Shows the name above a two-column layout:
 * face image on the left and section cards on the right.
 */
const Landing = () => {
  const { t, currentLang } = useTranslation();
  const navigate = useNavigate();
  const landingRef = useRef<HTMLDivElement>(null);
  const [landingHeight, setLandingHeight] = useState(0);

  useEffect(() => {
    const node = landingRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setLandingHeight(entry.target.scrollHeight);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={landingRef}
      sx={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingY: 4,
        overflowX: "hidden",
      }}
    >
      <Background totalHeight={landingHeight} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          zIndex: 1,
          width: "100%",
          maxWidth: 960,
          paddingX: { xs: 1, sm: 2, md: 4 },
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          {t("pages.portfolio.sections.cover.name")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 10,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 200,
              flexShrink: 0,
              overflow: "visible",
            }}
          >
            <Box
              component="img"
              src={Blob}
              aria-hidden
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "block",
                height: "auto",
                width: "175%",
                zIndex: -2,
              }}
            />
            <Box
              component="img"
              src={Lines}
              aria-hidden
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                display: "block",
                height: "auto",
                width: "195%",
                zIndex: -1,
                "@keyframes spin": {
                  "0%": { transform: "translate(-50%, -50%) rotate(0deg)" },
                  "100%": { transform: "translate(-50%, -50%) rotate(360deg)" },
                },
                animation: "spin 128s linear infinite",
              }}
            />
            <Box
              component="img"
              src={Face}
              alt={t("pages.portfolio.sections.cover.face")}
              sx={{
                display: "block",
                width: "100%",
                height: "auto",
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              flex: 1,
              width: { xs: "100%", md: "auto" },
            }}
          >
            {Object.keys(SITE_SECTIONS).map((sectionKey) => (
              <Card
                key={sectionKey}
                sx={(theme) => ({
                  backgroundColor: "primary.dark",
                  borderRadius: 0,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                  },
                })}
              >
                <CardActionArea
                  onClick={() => navigate(relativeToAbsolutePath(sectionKey, currentLang))}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                      padding: 3,
                      "&:last-child": { paddingBottom: 3 },
                    }}
                  >
                    <Box sx={{ fontSize: "1.75rem", lineHeight: 1, display: "flex", flexShrink: 0 }}>
                      {mapSiteSectionKeyToIcon(sectionKey)}
                    </Box>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {t(`pages.landing.sections.${sectionKey}.title`)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t(`pages.landing.sections.${sectionKey}.description`)}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;
