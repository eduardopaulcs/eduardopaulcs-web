const relativeToAbsolutePath = (relativePath: string, currentLang: string) => {
  if (!relativePath.startsWith("/")) {
    relativePath = "/" + relativePath;
  }
  return `/${currentLang}${relativePath}`;
};

export default relativeToAbsolutePath;
