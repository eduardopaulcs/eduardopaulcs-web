import { Box, Typography } from "@mui/material";
import useTranslation from "../../hooks/useTranslation";

const Footer = () => {
  const {t} = useTranslation();

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
        {t("footer.copyright")}
      </Typography>
    </Box>
  );
};

export default Footer;
