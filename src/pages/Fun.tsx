import { Box, Typography } from "@mui/material";
import useTranslation from "../hooks/useTranslation";

/**
 * Fun page. Placeholder until content is available.
 */
const Fun = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <Typography variant="h3" component="h1">
        {t("pages.fun.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("pages.fun.comingSoon")}
      </Typography>
    </Box>
  );
};

export default Fun;
