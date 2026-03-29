import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface PageTitleContextValue {
  pageTitle: string | null;
  setPageTitle: (title: string | null) => void;
}

const PageTitleContext = createContext<PageTitleContextValue>({
  pageTitle: null,
  setPageTitle: () => {},
});

/**
 * Provides a page-specific title that Layout.tsx combines with the site name.
 * Page components write their title via useDocumentTitle; Layout reads it here.
 */
export const PageTitleProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState<string | null>(null);

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

/**
 * Returns the current page title context value.
 */
export const usePageTitleContext = () => useContext(PageTitleContext);
