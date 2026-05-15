import { Box, Button, Paper, Typography } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";
import getEnvVariable from "../../../utils/getEnvVariable";
import { DONATION_URL } from "../../../constants";

/**
 * Donation call-to-action banner. Shown only when the env var is set.
 */
const DonationBanner = () => {
  const { t } = useTranslation();
  const donationUrl = getEnvVariable(DONATION_URL);
  if (!donationUrl) return null;

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        width: "100%",
        maxWidth: 480,
        p: 2,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        gap: 2,
        border: 1,
        borderColor: theme.palette.secondary.dark,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 0,
      })}
    >
      <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
        <Typography variant="subtitle1" component="h2">
          {t("pages.landing.donate.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("pages.landing.donate.description")}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="secondary"
        href={donationUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ flexShrink: 0 }}
      >
        {t("footer.donate")}
      </Button>
    </Paper>
  );
};

export default DonationBanner;
