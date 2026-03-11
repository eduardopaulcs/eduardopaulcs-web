import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Background from "../components/pages/Home/Background";
import Face from "../images/home/face.png";
import Blob from "../images/home/blob.png";
import Lines from "../images/home/lines.png";
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

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Background totalHeight={0} />
      {/* Centered content block */}
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
          paddingY: 4,
        }}
      >
        {/* Name above columns */}
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          {t("pages.home.sections.cover.name")}
        </Typography>
        {/* Two columns: face + cards */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 10,
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Face image — overflow visible so the portrait isn't clipped.
              Decorations (blob/lines) are at negative z-index so the cards
              cover any overflow that extends into the gap. */}
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
              alt={t("pages.home.sections.cover.face")}
              sx={{
                display: "block",
                width: "100%",
                height: "auto",
              }}
            />
          </Box>
          {/* Section cards */}
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
