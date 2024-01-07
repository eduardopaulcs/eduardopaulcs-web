import { Box, Stack, Typography } from "@mui/material";
import Face from "../../../images/home/face.png";
import Blob from "../../../images/home/blob.png";
import Lines from "../../../images/home/lines.png";
import useTranslation from "../../../hooks/useTranslation";

const CoverSection = () => {
  const {t} = useTranslation();

  return (
    <Box
      sx={{
        marginTop: "auto",
        marginBottom: "auto",
      }}
    >
      <Stack
        spacing={8}
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
            sx={{
              fontWeight: "bold",
            }}
          >
            {t("pages.home.sections.cover.name")}
          </Typography>
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{
              fontSize: "1.2em",
            }}
          >
            {t("pages.home.sections.cover.profession")}
          </Typography>
        </Stack>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            overflowX: "clip",
            overflowY: "visible",
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
              width: {
                xs: "95%",
                sm: "75%",
                md: "60%",
                lg: "40%",
              },
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
              width: {
                xs: "100%",
                sm: "85%",
                md: "70%",
                lg: "45%",
              },
              zIndex: -1,
              "@keyframes spin": {
                "0%": {
                  transform: "translate(-50%, -50%) rotate(0deg)",
                },
                "100%": {
                  transform: "translate(-50%, -50%) rotate(360deg)",
                },
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
