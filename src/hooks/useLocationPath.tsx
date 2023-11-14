import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

/**
 * Hook used to retrieve the current route the user is at. If absolute is passed
 * as true, then the whole path will be returned, otherwise the relative path
 * to the language parameter will be returned.
 */
const useLocationPath = (absolute = false) => {
  const location = useLocation();
  const [locationPath, setLocationPath] = useState<string>("");
  const params = useParams();

  useEffect(() => {
    const currentPath = location.pathname;
    let newPath = currentPath;
    const paramsLang = params.lang || null;

    // If we can return a relative path, and we are dealing with a translated
    // route
    if (
      !absolute &&
      (paramsLang && (new RegExp(`^/${paramsLang}[?#/]?`)).test(currentPath))
    ) {
      newPath = currentPath.substring(`/${paramsLang}`.length);

      if (!newPath.startsWith("/")) {
        newPath = "/" + newPath;
      }
    }
    // Otherwise we would have to return an aboslute path or we are dealing with
    // an un-translated route. For that case we just use the plain pathname

    setLocationPath(newPath);
  }, [location.pathname, absolute, params.lang]);

  return locationPath;
};

export default useLocationPath;
