import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

interface ContentProps {
  hasNavbar: boolean;
  disableContainer?: boolean;
}

/**
 * Site's main content component.
 */
const Content = ({ hasNavbar, disableContainer = false }: ContentProps) => {
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
        {disableContainer ? <Outlet /> : <Container><Outlet /></Container>}
      </Box>
    </>
  );
};

export default Content;
