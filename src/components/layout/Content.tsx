import React from 'react';
import { Box, Container, Theme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';

/**
 * Site's main content component.
 */
const Content = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  return (
    <>
      <Box
        component="main"
        style={{
          marginLeft: (!isMobile) ? "56px" : ""
        }}
      >
        <Container>
          <Outlet />
        </Container>
      </Box>
    </>
  );
};

export default Content;
