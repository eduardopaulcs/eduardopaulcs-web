import { SITE_SECTIONS } from "../constants";

export type NavContext = "portfolio" | "blogPost" | "other";

/**
 * Derives the navigation context from the current pathname.
 * Used by Navbar and BottomNav to decide which links to display.
 */
export const getNavContext = (pathname: string): NavContext => {
  const pathParts = pathname.split("/").filter(Boolean);

  if (pathParts.includes(SITE_SECTIONS.me)) {
    return "portfolio";
  }

  // Blog post detail: lang + "blog" + postId = 3 parts
  if (pathParts.includes(SITE_SECTIONS.blog) && pathParts.length > 2) {
    return "blogPost";
  }

  return "other";
};
