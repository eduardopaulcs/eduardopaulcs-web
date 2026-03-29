import { useEffect } from "react";
import { usePageTitleContext } from "../contexts/PageTitleContext";

/**
 * Sets the page-specific portion of document.title.
 * Layout.tsx reads it from context and constructs "{title} — {seo.title}".
 * Clears the title when the component unmounts.
 */
const useDocumentTitle = (title: string | null) => {
  const { setPageTitle } = usePageTitleContext();

  useEffect(() => {
    setPageTitle(title);
    return () => {
      setPageTitle(null);
    };
  }, [title, setPageTitle]);
};

export default useDocumentTitle;
