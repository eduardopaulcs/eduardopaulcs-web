import React, { cloneElement, useEffect, useState } from "react";
import { Box, Drawer, IconButton, Theme, useMediaQuery } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { useTranslation } from "react-i18next";
import NavbarList from "./NavbarList";
import { HOME_SECTIONS } from "../../constants";
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import LanguageIcon from '@mui/icons-material/Language';
import relativeToAbsolutePath from "../../utils/relativeToAbsolutePath";
import { useNavigate } from "react-router-dom";
import useScrollToLocation from "../../hooks/useScrollToLocation";
import NavbarListItem from "./NavbarListItem";

type NavbarLink = {
  route: string;
  isAbsolute: boolean;
  icon?: JSX.Element;
};

const navbarLinks: NavbarLink[] = [];

HOME_SECTIONS.forEach((section) => {
  const navbarLink: NavbarLink = {
    route: `/#${section}`,
    isAbsolute: false,
  };

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
  if (icon) {
    navbarLink["icon"] = icon;
  }

  // Add navbar link to the list
  navbarLinks.push(navbarLink);
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

    if (isMobile) {
      closeDrawer();
    }
  };

  /**
   * Transforms a NavbarLink into a NavbarListItem.
   */
  const transformNavbarLinkToNavbarListItem = (link: NavbarLink) => {
    const icon = (link.icon)
      ? link.icon
      : undefined;

    return <NavbarListItem
      action={() => handleLinkClick(link.route, link.isAbsolute)}
      icon={icon}
    />;
  };

  /**
   * Gets the list of NavbarListItem to use.
   */
  const getNavbarListItems = () => {
    // Navbar links
    const items = navbarLinks.map(transformNavbarLinkToNavbarListItem);

    // Navbar language selector
    items.push(
      <NavbarListItem
        icon={<LanguageIcon />}
      >
        Testing
      </NavbarListItem>
    );

    return items.map((item, idx) => cloneElement(item, {
      key: idx,
    }));
  };

  return (
    <>
      {isMobile && (
        <IconButton
          aria-label={t("navbar.hamburger.label")}
          onClick={handleHamburgerClick}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            marginTop: ".5rem",
            marginLeft: ".5rem",
            zIndex: 1000,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={drawerVariant}
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
        sx={{
          zIndex: 1050,
        }}
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
            <NavbarList>
              {getNavbarListItems()}
            </NavbarList>
          </Box>
          {isMobile && (
            <NavbarList>
              <NavbarListItem
                action={handleCloseDrawerClick}
                icon={<KeyboardDoubleArrowLeftIcon />}
              />
            </NavbarList>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
