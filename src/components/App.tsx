import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import customTheme from '../styles/customTheme';
import '../styles/App.css';

const App = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <>Test</>
    </ThemeProvider>
  );
};

export default App;
