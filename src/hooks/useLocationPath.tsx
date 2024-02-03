import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useLangParam from "./useLangParam";

const getLocationPath = (currentPath: string, langParam: string | null, isAbsolute: boolean) => {
  let newPath = currentPath;

  // If we can return a relative path, and we are dealing with a translated
  // route
  if (
    !isAbsolute &&
    (langParam && (new RegExp(`^/${langParam}[?#/]?`)).test(currentPath))
  ) {
    // Remove the language prefix
    newPath = currentPath.substring(`/${langParam}`.length);

    // Add back starting slash in case we just deleted it
    if (!newPath.startsWith("/")) {
      newPath = "/" + newPath;
    }
  }
  // Otherwise we would have to return an aboslute path or we are dealing with
  // an un-translated route. For that case we just use the plain pathname

  return newPath;
};

/**
 * Hook used to retrieve the current route the user is at. If isAbsolute is
 * passed as true, then the whole path will be returned, otherwise the relative
 * path to the language parameter will be returned.
 */
const useLocationPath = (isAbsolute = false) => {
  const {pathname} = useLocation();
  const langParam = useLangParam();

  const [locationPath, setLocationPath] = useState<string>(getLocationPath(pathname, langParam, isAbsolute));

  useEffect(() => {
    setLocationPath(getLocationPath(pathname, langParam, isAbsolute));
  }, [pathname, langParam, isAbsolute]);

  return locationPath;
};

export default useLocationPath;
