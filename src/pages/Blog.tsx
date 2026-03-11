import { Box, Typography } from "@mui/material";
import useTranslation from "../hooks/useTranslation";

/**
 * Blog page. Placeholder until content is available.
 */
const Blog = () => {
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
        {t("pages.blog.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("pages.blog.comingSoon")}
      </Typography>
    </Box>
  );
};

export default Blog;
