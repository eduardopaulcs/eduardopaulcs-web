import { Article, Person, QuestionMark, SportsEsports } from "@mui/icons-material";

/**
 * Maps a site section key to its navbar icon.
 */
export const mapSiteSectionKeyToIcon = (sectionKey: string) => {
  let icon = null;

  switch (sectionKey) {
    case "portfolio":
      icon = <Person />;
      break;

    case "blog":
      icon = <Article />;
      break;

    case "fun":
      icon = <SportsEsports />;
      break;

    default:
      icon = <QuestionMark />;
      break;
  };

  return icon;
};
