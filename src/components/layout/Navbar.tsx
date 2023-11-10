import React, { useEffect, useState } from "react";
import { Box, Drawer, IconButton, Theme, useMediaQuery } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from "react-i18next";
import NavbarList from "./NavbarList";

const navbarLinks = [
  {
    route: "#",
    icon: <HomeIcon />,
  },
];

/**
 * Site Navbar. Usually found on the left side of the screen, hidden by default
 * on mobile.
 */
const Navbar = () => {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [drawerVariant, setDrawerVariant] = useState<"temporary"|"permanent">(isMobile ? "temporary" : "permanent");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(!isMobile);
  const [t] = useTranslation("common");

  useEffect(() => {
    // When the screen size changes

    // Change drawer
    setDrawerVariant(isMobile ? "temporary" : "permanent");
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  /**
   * Toggles the drawer open state.
   */
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  /**
   * Closes the drawer.
   */
  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  /**
   * Handles click on the hamburger or menu button (only for mobile).
   */
  const handleHamburgerClick = () => {
    if (!isMobile) {
      return;
    }

    toggleDrawer();
  };

  /**
   * Handles click on the "close drawer" button (only for mobile).
   */
  const handleCloseDrawerClick = () => {
    if (!isMobile) {
      return;
    }

    closeDrawer();
  };

  /**
   * Handles click on a navbar link.
   */
  const handleLinkClick = (route: string) => {
    console.log(route);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100vh",
      }}
    >
      {isMobile && (
        <IconButton
          aria-label={t("navbar.hamburger.label")}
          onClick={handleHamburgerClick}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={drawerVariant}
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: (isMobile) ? "start" : "center",
              alignItems: "center",
            }}
          >
            <NavbarList
              items={navbarLinks.map((link) => {
                return {
                  action: () => handleLinkClick(link.route),
                  icon: link.icon,
                };
              })}
            />
          </Box>
          {isMobile && (
            <NavbarList
              items={[
                {
                  action: handleCloseDrawerClick,
                  icon: <KeyboardDoubleArrowLeftIcon />,
                },
              ]}
            />
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
