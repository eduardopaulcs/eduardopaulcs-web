import { Container } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';

const Content = () => {
  return (
    <>
      <main>
        <Container>
          <Outlet />
        </Container>
      </main>
    </>
  );
};

export default Content;
