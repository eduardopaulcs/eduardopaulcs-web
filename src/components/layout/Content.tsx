import React from 'react';
import { Container, Theme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';

/**
 * Site's main content component.
 */
const Content = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  return (
    <>
      <main
        style={{
          marginLeft: (!isMobile) ? "56px" : ""
        }}
      >
        <Container>
          <Outlet />
        </Container>
      </main>
    </>
  );
};

export default Content;
