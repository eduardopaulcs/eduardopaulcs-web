import { MutableRefObject, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HOME_SECTIONS } from "../constants";

/**
 * Keeps the URL hash in sync with the most visible section as the user scrolls.
 * Uses IntersectionObserver to track visibility ratios across all home sections.
 * Stores the exact hash value in `syncHashRef` before each navigate call so
 * `useScrollToLocation` can skip auto-scroll only when the hash change matches
 * what the observer set — preventing false positives when the user clicks a
 * nav link concurrently with an observer fire.
 * Skips updates entirely while `isNavigatingRef` is true (programmatic scroll in progress).
 */
const useScrollHashSync = (
  isNavigatingRef: MutableRefObject<boolean>,
  syncHashRef: MutableRefObject<string | null>
): void => {
  const navigate = useNavigate();

  useEffect(() => {
    const sectionIds = Object.values(HOME_SECTIONS);
    const visibilityMap: Record<string, number> = {};

    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavigatingRef.current) return;

        entries.forEach((entry) => {
          visibilityMap[entry.target.id] = entry.intersectionRatio;
        });

        let mostVisibleId = "";
        let maxRatio = 0;
        Object.entries(visibilityMap).forEach(([id, ratio]) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisibleId = id;
          }
        });

        if (mostVisibleId) {
          // Store the exact hash being set so useScrollToLocation can match it
          // precisely and skip the scroll only for this specific change.
          syncHashRef.current = `#${mostVisibleId}`;
          navigate({ hash: `#${mostVisibleId}` }, { replace: true });
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navigate, isNavigatingRef, syncHashRef]);
};

export default useScrollHashSync;
