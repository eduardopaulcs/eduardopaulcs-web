import React, { useEffect, useState } from "react";
import { Box, Drawer, IconButton, Theme, useMediaQuery } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { useTranslation } from "react-i18next";
import NavbarList from "./NavbarList";
import { HOME_SECTIONS } from "../../constants";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import relativeToAbsolutePath from "../../utils/relativeToAbsolutePath";
import { useNavigate } from "react-router-dom";
import useScrollToLocation from "../../hooks/useScrollToLocation";

type NavbarLink = {
  route: string;
  isAbsolute: boolean;
  icon: JSX.Element | null;
};

const navbarLinks: NavbarLink[] = [];

HOME_SECTIONS.forEach((section) => {
  let icon = null;

  // Select icon
  switch (section) {
    case "inicio":
      icon = <HomeIcon />;
      break;

    case "sobre-mi":
      icon = <PersonIcon />;
      break;

    case "contacto":
      icon = <MessageIcon />;
      break;

    default:
      break;
  };

  // Add navbar link to the list
  navbarLinks.push({
    route: `/#${section}`,
    isAbsolute: false,
    icon: icon,
  });
});

/**
 * Site Navbar. Usually found on the left side of the screen, hidden by default
 * on mobile.
 */
const Navbar = () => {
  useScrollToLocation();

  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [t, i18n] = useTranslation("common");
  const [drawerVariant, setDrawerVariant] = useState<"temporary"|"permanent">(isMobile ? "temporary" : "permanent");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(!isMobile);

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
  const handleLinkClick = (route: string, isAbsolute: boolean) => {
    const navigationRoute = (isAbsolute)
      ? route
      : relativeToAbsolutePath(route, i18n.language);

    navigate(navigationRoute);
  };

  return (
    <Box
      sx={{
        position: "fixed",
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
                  action: () => handleLinkClick(link.route, link.isAbsolute),
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
