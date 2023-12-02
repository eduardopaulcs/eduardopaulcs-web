import React, { cloneElement, useEffect, useState } from "react";
import { Box, Drawer, IconButton, Theme, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useTranslation } from "react-i18next";
import NavbarList from "./NavbarList";
import { HOME_SECTIONS } from "../../constants";
import LanguageIcon from '@mui/icons-material/Language';
import relativeToAbsolutePath from "../../utils/relativeToAbsolutePath";
import { useNavigate } from "react-router-dom";
import useScrollToLocation from "../../hooks/useScrollToLocation";
import NavbarListItem from "./NavbarListItem";
import { mapSectionKeyToIcon } from "../../utils/homeSectionMappers";

type NavbarLink = {
  route: string;
  isAbsolute: boolean;
  icon: JSX.Element;
  labelKey: string;
};

const navbarLinks: NavbarLink[] = [];

Object.entries(HOME_SECTIONS).forEach(([sectionKey, sectionRoute]) => {
  const navbarLink: NavbarLink = {
    route: `/#${sectionRoute}`,
    isAbsolute: false,
    icon: mapSectionKeyToIcon(sectionKey),
    labelKey: sectionKey,
  };

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
  const theme = useTheme();
  const primaryDarkColor = theme.palette.primary.dark;

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
    return <NavbarListItem
      action={() => handleLinkClick(link.route, link.isAbsolute)}
      icon={link.icon}
      label={t(`navbar.link.${link.labelKey}`)}
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
        label={t("navbar.changeLanguage")}
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
        <Box
          sx={(theme) => ({
            position: "fixed",
            display: "flex",
            top: 0,
            left: 0,
            zIndex: 1000,
            width: theme.custom.components.navbar.width,
            height: theme.custom.components.navbar.width,
            justifyContent: "center",
            alignItems: "center",
          })}
        >
          <IconButton
            aria-label={t("navbar.openCloseNavigation")}
            onClick={handleHamburgerClick}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}
      <Drawer
        variant={drawerVariant}
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
        sx={{
          zIndex: 1050,
        }}
        PaperProps={{
          sx: {
            backgroundColor: {
              xs: primaryDarkColor,
              sm: "transparent",
            },
            backgroundImage: "none",
            border: 0,
          },
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
              justifyContent: {
                xs: "start",
                sm: "center",
              },
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
                icon={<KeyboardArrowLeftIcon />}
                label={t("navbar.closeNavigation")}
              />
            </NavbarList>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
