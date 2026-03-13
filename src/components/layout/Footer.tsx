import { Box, Typography } from "@mui/material";
import useTranslation from "../../hooks/useTranslation";

const FIRST_YEAR = 2024;

/**
 * Site footer. Displays a dynamic copyright year range.
 */
const Footer = () => {
  const {t} = useTranslation();
  const currentYear = new Date().getFullYear();
  const yearRange = currentYear > FIRST_YEAR ? `${FIRST_YEAR}–${currentYear}` : `${FIRST_YEAR}`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        padding: "2rem 1rem",
        marginTop: "auto",
      }}
    >
      <Typography
        sx={{
          fontSize: "caption.fontSize",
          margin: "auto",
        }}
      >
        {t("footer.copyright", { yearRange })}
      </Typography>
    </Box>
  );
};

export default Footer;
