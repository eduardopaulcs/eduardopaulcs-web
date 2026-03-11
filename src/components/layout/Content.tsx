import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

interface ContentProps {
  hasNavbar: boolean;
}

/**
 * Site's main content component.
 */
const Content = ({ hasNavbar }: ContentProps) => {
  return (
    <>
      <Box
        component="main"
        sx={(theme) => ({
          marginLeft: hasNavbar ? {
            sm: theme.custom.components.navbar.width,
          } : 0,
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
