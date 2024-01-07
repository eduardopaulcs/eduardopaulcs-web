import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const getLangParam = (lang: string | undefined) => {
  return (lang)
    ? lang.toLowerCase()
    : null;
};

/**
 * Hook used to retrieve the language parameter from the URL. If there's no
 * language specified (by the user or because we are not in a localized page)
 * then null will be returned. Keep in mind it doesn't check whether the
 * specified language is valid or not.
 */
const useLangParam = () => {
  const {lang} = useParams();

  const [langParam, setLangParam] = useState<string | null>(getLangParam(lang));

  useEffect(() => {
    setLangParam(getLangParam(lang));
  }, [lang]);

  return langParam;
};

export default useLangParam;
