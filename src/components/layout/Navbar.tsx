import React, { cloneElement, useEffect, useState } from "react";
import { Box, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useTranslation } from "react-i18next";
import NavbarList from "./NavbarList";
import { HOME_SECTIONS, LANGUAGES } from "../../constants";
import LanguageIcon from '@mui/icons-material/Language';
import relativeToAbsolutePath from "../../utils/relativeToAbsolutePath";
import { useNavigate, useParams } from "react-router-dom";
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
  navbarLinks.push({
    route: `/#${sectionRoute}`,
    isAbsolute: false,
    icon: mapSectionKeyToIcon(sectionKey),
    labelKey: sectionKey,
  });
});

const calculateTranslatedPage = (lang: string | undefined) => {
  // TODO: move to another place
  return (lang !== undefined && LANGUAGES.includes(lang));
};

/**
 * Site Navbar. Usually found on the left side of the screen, hidden by default
 * on mobile.
 */
const Navbar = () => {
  useScrollToLocation();

  const navigate = useNavigate();
  const [t, i18n] = useTranslation("common");
  const params = useParams();
  const [translatedPage, setTranslatedPage] = useState<boolean>(calculateTranslatedPage(params.lang));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerVariant, setDrawerVariant] = useState<"temporary"|"permanent">(isMobile ? "temporary" : "permanent");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(!isMobile);
  const [changeLanguageOpen, setChangeLanguageOpen] = useState<boolean>(false);
  const primaryDarkColor = theme.palette.primary.dark;

  useEffect(() => {
    // When the screen size changes

    // Change drawer
    setDrawerVariant(isMobile ? "temporary" : "permanent");
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    // When the URL language parameter changes

    setTranslatedPage(calculateTranslatedPage(params.lang));
  }, [params.lang]);

  /**
   * Toggles the drawer open state (only for mobile).
   */
  const toggleDrawer = () => {
    if (isMobile) {
      if (drawerOpen) {
        closeChangeLanguage();
      }
      setDrawerOpen(!drawerOpen);
    }
  };

  /**
   * Closes the drawer (only for mobile).
   */
  const closeDrawer = () => {
    if (isMobile) {
      closeChangeLanguage();
      setDrawerOpen(false);
    }
  };

  /**
   * Toggles the change language button (only for translated pages).
   */
  const toggleChangeLanguage = () => {
    if (translatedPage) {
      setChangeLanguageOpen(!changeLanguageOpen);
    }
  };

  /**
   * Closes the change language button (only for translated pages).
   */
  const closeChangeLanguage = () => {
    if (translatedPage) {
      setChangeLanguageOpen(false);
    }
  };

  /**
   * Handles click on the hamburger or menu button.
   */
  const handleHamburgerClick = () => {
    toggleDrawer();
  };

  /**
   * Handles click on the "close drawer" button.
   */
  const handleCloseDrawerClick = () => {
    closeDrawer();
  };

  /**
   * Handles click on a navbar link.
   */
  const handleLinkClick = (route: string, isAbsolute: boolean) => {
    const navigationRoute = (isAbsolute)
      ? route
      : relativeToAbsolutePath(route, i18n.language);

    navigate(navigationRoute, {
      replace: !isAbsolute,
    });

    closeDrawer();
  };

  /**
   * Handles click on the "change language" button.
   */
  const handleChangeLanguageClick = () => {
    toggleChangeLanguage();
  };

  /**
   * Handles click on a new language.
   */
  const handleLanguageClick = (lang: string) => {
    if (i18n.language !== lang) {
      navigate(`/${lang}`, {
        replace: true,
      });
    }

    closeChangeLanguage();
    closeDrawer();
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

    if (translatedPage && LANGUAGES.length > 1) {
      // Navbar language selector
      items.push(
        <NavbarListItem
          action={() => handleChangeLanguageClick()}
          icon={<LanguageIcon />}
          label={t("navbar.changeLanguage")}
          open={changeLanguageOpen}
        >
          <NavbarList>
            {LANGUAGES.map((lang, idx) => (
              <NavbarListItem
                key={idx}
                action={() => handleLanguageClick(lang)}
                text={lang.toUpperCase()}
              />
            ))}
          </NavbarList>
        </NavbarListItem>
      );
    }

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
