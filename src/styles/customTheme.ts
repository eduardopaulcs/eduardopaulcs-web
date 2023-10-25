import { createTheme } from "@mui/material";

const workSansFamily = [
  '"Work Sans"',
  'sans-serif',
].join(', ');

const inconsolataFamily = [
  '"Inconsolata"',
  'monospace',
].join(', ');

export default createTheme({
  palette: {
    mode: 'dark',
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
});
