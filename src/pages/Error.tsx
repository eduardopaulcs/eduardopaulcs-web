import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import useTranslation from "../hooks/useTranslation";
import { Box, Button, Stack, Typography } from "@mui/material";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/**
 * Page shown when an error occurs on the frontend. Usually used for 404 error
 * page.
 */
const Error = () => {
  const {t} = useTranslation();

  const error = useRouteError();
  const isRouteError = isRouteErrorResponse(error);
  const status = isRouteError ? error.status : 0;

  /**
   * Gets the error title to display.
   */
  const getErrorTitle = () => {
    if (status > 0) {
      return t("pages.error.titles.code", {code: status});
    }

    return t("pages.error.titles.generic");
  };

  /**
   * Gets the error description to display.
   */
  const getErrorDescription = () => {
    if (status > 0) {
      return t(`pages.error.descriptions.${status}`);
    }

    return t("pages.error.descriptions.generic");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "3rem",
            margin: "2rem",
            backgroundColor: "primary.dark",
          }}
        >
          <Stack
            gap={4}
          >
            <Typography
              component="h2"
              variant="h4"
            >
              {getErrorTitle()}
            </Typography>
            <Typography>
              {getErrorDescription()}
            </Typography>
            <Button
              component={Link}
              to="/"
              sx={{
                borderRadius: 0,
                color: "text.primary",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              {t("pages.error.goBack")}
            </Button>
          </Stack>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Error;
