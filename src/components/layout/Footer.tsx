import { Box, Button, Typography } from "@mui/material";
import useTranslation from "../../hooks/useTranslation";
import getEnvVariable from "../../utils/getEnvVariable";
import { DONATION_URL } from "../../constants";

const FIRST_YEAR = 2024;

/**
 * Site footer. Displays a dynamic copyright year range.
 */
const Footer = () => {
  const {t} = useTranslation();
  const currentYear = new Date().getFullYear();
  const yearRange = currentYear > FIRST_YEAR ? `${FIRST_YEAR}–${currentYear}` : `${FIRST_YEAR}`;
  const donationUrl = getEnvVariable(DONATION_URL);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "background.default",
        padding: "2rem 1rem",
        marginTop: "auto",
        gap: 1,
      }}
    >
      {donationUrl && (
        <Button
          href={donationUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          sx={{ fontSize: "caption.fontSize" }}
        >
          {t("footer.donate")}
        </Button>
      )}
      <Typography
        sx={{
          fontSize: "caption.fontSize",
        }}
      >
        {t("footer.copyright", { yearRange })}
      </Typography>
    </Box>
  );
};

export default Footer;
