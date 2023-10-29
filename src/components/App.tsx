import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '../routes/router';
import { CssBaseline, ThemeProvider } from '@mui/material';
import customTheme from '../styles/customTheme';
import '../styles/App.css';

const App = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
