import { Box, Stack, Typography } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";
import useTranslationArray from "../../../hooks/useTranslationArray";

/**
 * About Me section of the portfolio page. Shows a personal description.
 */
const AboutMeSection = () => {
  const {t} = useTranslation();
  const aboutMe = useTranslationArray<string>("pages.home.sections.aboutMe.description");

  return (
    <Box
      sx={{
        marginTop: "auto",
        marginBottom: "auto",
      }}
    >
      <Stack spacing={4}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: "bold",
          }}
        >
          {t("pages.home.sections.aboutMe.title")}
        </Typography>
        <Stack spacing={2}>
          {aboutMe.map((paragraph, idx) => (
            <Typography key={idx}>
              {paragraph}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default AboutMeSection;
