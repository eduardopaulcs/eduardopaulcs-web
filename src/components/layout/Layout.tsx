import React from "react";
import Content from "./Content";
import { Box } from "@mui/material";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { DEFAULT_LANG, LANGUAGES } from "../../constants";

const Layout = () => {
  const location = useLocation();
  const params = useParams();

  const shouldRedirect = () => {
    if (
      (params.lang !== undefined && !LANGUAGES.includes(params.lang)) ||
      location.pathname === "/"
    ) {
      return true;
    }

    return false;
  };

  const renderContent = () => {
    if (shouldRedirect()) {
      return (
        <Navigate to={`/${DEFAULT_LANG}`} replace />
      );
    }

    return (
      <Box
        sx={{
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Content />
      </Box>
    );
  };

  return (
    <>
      {renderContent()}
    </>
  );
};

export default Layout;
