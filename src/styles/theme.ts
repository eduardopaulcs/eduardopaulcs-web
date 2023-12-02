import { createTheme } from "@mui/material";
import customTheme from "./customTheme.json";

// Quick patch to prevent MUI types from interfering with custom properties
declare module "@mui/material/styles" {
  interface ThemeOptions {
    [key: string]: any;
  }
  interface Theme {
    [key: string]: any;
  }
}

const workSansFamily = [
  '"Work Sans"',
  'sans-serif',
].join(', ');

const inconsolataFamily = [
  '"Inconsolata"',
  'monospace',
].join(', ');

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#5c8099",
      light: "#c7dae7",
      dark: "#324a5b",
    },
    secondary: {
      main: "#5c6199",
      light: "#c3c6db",
      dark: "#2d2d69",
    },
    background: {
      default: "#151c21",
      paper: "#151c21",
    },
  },
  typography: {
    fontFamily: workSansFamily,
    h1: {
      fontFamily: inconsolataFamily,
    },
    h2: {
      fontFamily: inconsolataFamily,
    },
    h3: {
      fontFamily: inconsolataFamily,
    },
    h4: {
      fontFamily: inconsolataFamily,
    },
    h5: {
      fontFamily: inconsolataFamily,
    },
    h6: {
      fontFamily: inconsolataFamily,
    },
  },
  custom: customTheme,
});

export default theme;
