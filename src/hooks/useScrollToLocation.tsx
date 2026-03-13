import { MutableRefObject, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the element matching the current URL hash whenever the hash changes.
 * Accepts `syncHashRef` — set by the scroll-sync observer to the exact hash it
 * navigated to. When the incoming hash matches that value, the change is treated
 * as observer-driven and no scroll is triggered. Using the hash value (rather than
 * a plain boolean) avoids a race condition where a concurrent nav-click would be
 * incorrectly suppressed.
 * Returns a ref that is `true` while a programmatic scroll is in progress,
 * which callers can use to suppress concurrent scroll-driven side effects.
 */
const useScrollToLocation = (syncHashRef: MutableRefObject<string | null>): MutableRefObject<boolean> => {
  const isNavigatingRef = useRef(false);
  const scrolledRef = useRef(false);
  const {hash} = useLocation();
  const hashRef = useRef(hash);

  useEffect(() => {
    if (hash) {
      // We want to reset if the hash has changed
      if (hashRef.current !== hash) {
        hashRef.current = hash;

        // If this hash change matches what the scroll-sync observer set, skip
        // scrolling — the user already scrolled there manually.
        if (syncHashRef.current === hash) {
          syncHashRef.current = null;
          scrolledRef.current = true;
          return;
        }

        scrolledRef.current = false;
      }

      // Only attempt to scroll if we haven't yet (this could have just reset
      // above if hash changed)
      if (!scrolledRef.current) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          isNavigatingRef.current = true;
          element.scrollIntoView({ behavior: "smooth" });
          scrolledRef.current = true;
          // Reset the flag once the browser finishes scrolling
          window.addEventListener("scrollend", () => {
            isNavigatingRef.current = false;
          }, { once: true });
        }
      }
    }
  }, [hash, syncHashRef]);

  return isNavigatingRef;
};

export default useScrollToLocation;
