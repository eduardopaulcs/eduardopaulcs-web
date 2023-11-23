import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Face from "../../../images/face.png";

const CoverSection = () => {
  const [t] = useTranslation("common");

  return (
    <Box
      sx={{
        marginTop: "auto",
        marginBottom: "auto",
      }}
    >
      <Stack
        spacing={4}
      >
        <Stack
          spacing={2}
          sx={{
            textAlign: "center"
          }}
        >
          <Typography
            variant="h3"
            component="h1"
          >
            {t("pages.home.sections.cover.name")}
          </Typography>
          <Typography
            variant="subtitle1"
            component="h2"
          >
            {t("pages.home.sections.cover.profession")}
          </Typography>
        </Stack>
        <Box
          sx={{
            display: "flex",
          }}
        >
          <Box
            component="img"
            src={Face}
            alt={t("pages.home.sections.cover.face")}
            sx={{
              display: "block",
              height: "auto",
              width: {
                xs: "50%",
                sm: "40%",
                md: "30%",
                lg: "20%",
              },
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default CoverSection;
