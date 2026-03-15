import { cloneElement, useRef } from "react";
import { Box, Drawer } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavbarList from "./NavbarList";
import { HOME_SECTIONS, SITE_SECTIONS } from "../../constants";
import relativeToAbsolutePath from "../../utils/relativeToAbsolutePath";
import { useLocation, useNavigate } from "react-router-dom";
import useScrollToLocation from "../../hooks/useScrollToLocation";
import useScrollHashSync from "../../hooks/useScrollHashSync";
import NavbarListItem from "./NavbarListItem";
import { mapSectionKeyToIcon } from "../../utils/homeSectionMappers";
import useTranslation from "../../hooks/useTranslation";
import { getNavContext } from "../../utils/navContextMapper";

type NavbarLink = {
  key: string;
  route: string;
  icon: JSX.Element;
  isAbsolute: boolean;
};

/**
 * Builds the navbar link list dynamically based on the current route context.
 * On the portfolio page (`/me`), shows home section links with hash anchors.
 * On a blog post detail page, shows a single "Back to Blog" link.
 * On the blog list page or other pages, shows no section links.
 */
const getNavbarLinks = (pathname: string): NavbarLink[] => {
  const context = getNavContext(pathname);

  if (context === "portfolio") {
    return Object.entries(HOME_SECTIONS).map(([sectionKey, sectionRoute]) => ({
      key: sectionKey,
      route: `${SITE_SECTIONS.me}#${sectionRoute}`,
      icon: mapSectionKeyToIcon(sectionKey),
      isAbsolute: false,
    }));
  }

  if (context === "blogPost") {
    return [{
      key: "backToBlog",
      route: SITE_SECTIONS.blog,
      icon: <ArrowBackIcon />,
      isAbsolute: false,
    }];
  }

  return [];
};

/**
 * Site Navbar. Permanent left sidebar shown on desktop for all non-game pages.
 * On mobile, navigation is handled by BottomNav instead.
 * Also hosts the scroll synchronization hooks for the /me page.
 */
const Navbar = () => {
  const syncHashRef = useRef<string | null>(null);
  const isNavigatingRef = useScrollToLocation(syncHashRef);
  useScrollHashSync(isNavigatingRef, syncHashRef);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, currentLang } = useTranslation();

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
        return;
      }
    }

    const navigationRoute = (isAbsolute)
      ? route
      : relativeToAbsolutePath(route, currentLang);

    navigate(navigationRoute, {
      replace: !isAbsolute,
    });
  };

  /**
   * Handles click on the "go back to landing" button.
   */
  const handleGoBackClick = () => {
    navigate(relativeToAbsolutePath("/", currentLang), { replace: false });
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
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        zIndex: 1050,
        display: { xs: "none", sm: "block" },
      }}
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
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
        <NavbarList>
          <NavbarListItem
            action={handleGoBackClick}
            icon={<HomeIcon />}
            label={t("navbar.goBack")}
          />
        </NavbarList>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NavbarList>
            {getNavbarListItems()}
          </NavbarList>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Navbar;
