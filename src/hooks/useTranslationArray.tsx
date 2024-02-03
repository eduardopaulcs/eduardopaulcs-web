import { useEffect, useState } from "react";
import useTranslation from "./useTranslation";
import type { $SpecialObject } from "i18next/typescript/helpers";

const getTranslationArray = <T,>(specialObject: $SpecialObject) => {
  let toReturn: T[] = [];

  // ToDo: Actually check types here, we are currently assuming the returned
  //       object is the correct type
  if (Array.isArray(specialObject)) {
    toReturn = specialObject.map((item) => item as T);
  } else {
    toReturn = [specialObject as T];
  }

  return toReturn;
};

/**
 * Hook used to get arrays out of translations.
 * ToDo: Support replacing values with options.
 */
const useTranslationArray = <T,>(key: string, ns: string | null = null) => {
  const {t} = useTranslation(ns);

  const [items, setItems] = useState<T[]>(getTranslationArray(t(key, {returnObjects: true})));

  useEffect(() => {
    const specialObject = t(key, {returnObjects: true});
    setItems(getTranslationArray<T>(specialObject));
  }, [key, t]);

  return items;
};

export default useTranslationArray;
