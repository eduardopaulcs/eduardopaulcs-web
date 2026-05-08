import { RouterProvider } from "react-router-dom";
import router from "../routes/router";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { I18nextProvider } from "react-i18next";
import translator from "../translations/translator";
import UmamiAnalytics from "./analytics/UmamiAnalytics";
import "../styles/App.css";

/**
 * Global app component.
 */
const App = () => {
  return (
    <I18nextProvider i18n={translator}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UmamiAnalytics />
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
