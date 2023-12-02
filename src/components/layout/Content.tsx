import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

/**
 * Site's main content component.
 */
const Content = () => {
  return (
    <>
      <Box
        component="main"
        sx={(theme) => ({
          marginLeft: {
            sm: theme.custom.components.navbar.width,
          },
        })}
      >
        <Container>
          <Outlet />
        </Container>
      </Box>
    </>
  );
};

export default Content;
