import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '../routes/router';
import { CssBaseline, ThemeProvider } from '@mui/material';
import customTheme from '../styles/customTheme';
import { I18nextProvider } from 'react-i18next';
import translator from '../translations/translator';
import '../styles/App.css';

/**
 * Global app component.
 */
const App = () => {
  return (
    <I18nextProvider i18n={translator}>
      <ThemeProvider theme={customTheme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
