import { cloneElement, useEffect, useRef, useState } from "react";
import { Box, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import HomeIcon from "@mui/icons-material/Home";
import NavbarList from "./NavbarList";
import { HOME_SECTIONS, SITE_SECTIONS } from "../../constants";
import relativeToAbsolutePath from "../../utils/relativeToAbsolutePath";
import { useLocation, useNavigate } from "react-router-dom";
import useScrollToLocation from "../../hooks/useScrollToLocation";
import useScrollHashSync from "../../hooks/useScrollHashSync";
import NavbarListItem from "./NavbarListItem";
import { mapSectionKeyToIcon } from "../../utils/homeSectionMappers";
import { mapSiteSectionKeyToIcon } from "../../utils/siteSectionMappers";
import useTranslation from "../../hooks/useTranslation";

type NavbarLink = {
  key: string;
  route: string;
  icon: JSX.Element;
  isAbsolute: boolean;
};

type DrawerVariant = "temporary" | "permanent";

/**
 * Builds the navbar link list dynamically based on the current route context.
 * On the portfolio page (`/me`), shows home section links with hash anchors.
 * On all other pages, shows site section links.
 */
const getNavbarLinks = (pathname: string): NavbarLink[] => {
  const isPortfolioPage = pathname.split("/").includes(SITE_SECTIONS.me);

  if (isPortfolioPage) {
    return Object.entries(HOME_SECTIONS).map(([sectionKey, sectionRoute]) => ({
      key: sectionKey,
      route: `${SITE_SECTIONS.me}#${sectionRoute}`,
      icon: mapSectionKeyToIcon(sectionKey),
      isAbsolute: false,
    }));
  }

  return Object.keys(SITE_SECTIONS).map((sectionKey) => ({
    key: sectionKey,
    route: sectionKey,
    icon: mapSiteSectionKeyToIcon(sectionKey),
    isAbsolute: false,
  }));
};

/**
 * Site Navbar. Usually found on the left side of the screen, hidden by default
 * on mobile.
 */
const Navbar = () => {
  const syncHashRef = useRef<string | null>(null);
  const isNavigatingRef = useScrollToLocation(syncHashRef);
  useScrollHashSync(isNavigatingRef, syncHashRef);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {t, currentLang} = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [drawerVariant, setDrawerVariant] = useState<DrawerVariant>(
    isMobile ? "temporary" : "permanent"
  );
  const [drawerOpen, setDrawerOpen] = useState<boolean>(!isMobile);

  useEffect(() => {
    // When the screen size changes

    // Change drawer
    setDrawerVariant(isMobile ? "temporary" : "permanent");
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  /**
   * Toggles the drawer open state (only for mobile).
   */
  const toggleDrawer = () => {
    if (isMobile) {
      setDrawerOpen(!drawerOpen);
    }
  };

  /**
   * Closes the drawer (only for mobile).
   */
  const closeDrawer = () => {
    if (isMobile) {
      setDrawerOpen(false);
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
    // If the target hash matches the current one, navigate() won't trigger
    // useScrollToLocation (no hash change), so we scroll directly instead.
    if (!isAbsolute) {
      const targetHash = route.includes("#") ? route.split("#")[1] : "";
      const currentHash = window.location.hash.replace("#", "");
      if (targetHash && targetHash === currentHash) {
        const element = document.getElementById(targetHash);
        if (element) {
          isNavigatingRef.current = true;
          element.scrollIntoView({ behavior: "smooth" });
          window.addEventListener("scrollend", () => {
            isNavigatingRef.current = false;
          }, { once: true });
        }
        closeDrawer();
        return;
      }
    }

    const navigationRoute = (isAbsolute)
      ? route
      : relativeToAbsolutePath(route, currentLang);

    navigate(navigationRoute, {
      replace: !isAbsolute,
    });

    closeDrawer();
  };

  /**
   * Handles click on the "go back to landing" button.
   */
  const handleGoBackClick = () => {
    navigate(relativeToAbsolutePath("/", currentLang), { replace: false });
    closeDrawer();
  };

  /**
   * Transforms a NavbarLink into a NavbarListItem.
   */
  const transformNavbarLinkToNavbarListItem = (link: NavbarLink) => {
    return <NavbarListItem
      action={() => handleLinkClick(link.route, link.isAbsolute)}
      icon={link.icon}
      label={t(`navbar.links.${link.key}`)}
    />;
  };

  /**
   * Gets the list of NavbarListItem to use (section links only).
   */
  const getNavbarListItems = () => {
    const navbarLinks = getNavbarLinks(pathname);
    return navbarLinks.map((link, idx) => cloneElement(
      transformNavbarLinkToNavbarListItem(link),
      { key: idx }
    ));
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
            aria-label={t("navbar.toggleNavigation")}
            onClick={handleHamburgerClick}
            sx={{
              backgroundColor: "primary.dark",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
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
              xs: "primary.dark",
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
          {/* Desktop: go-back at top */}
          {!isMobile && (
            <NavbarList>
              <NavbarListItem
                action={handleGoBackClick}
                icon={<HomeIcon />}
                label={t("navbar.goBack")}
              />
            </NavbarList>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: {
                xs: "initial",
                sm: "100%",
              },
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
          {/* Mobile: go-back + close at bottom */}
          {isMobile && (
            <NavbarList>
              <NavbarListItem
                action={handleGoBackClick}
                icon={<HomeIcon />}
                label={t("navbar.goBack")}
              />
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
