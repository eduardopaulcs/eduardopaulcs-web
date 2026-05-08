import { Build, Info, Message, QuestionMark, WorkHistory } from "@mui/icons-material";
import AboutMeSection from "../components/pages/Portfolio/AboutMeSection";
import ExperienceSection from "../components/pages/Portfolio/ExperienceSection";
import ToolsSection from "../components/pages/Portfolio/ToolsSection";
import ContactSection from "../components/pages/Portfolio/ContactSection";

/**
 * Maps a portfolio section key to its navbar icon.
 */
export const mapSectionKeyToIcon = (sectionKey: string) => {
  let icon = null;

  switch (sectionKey) {
    case "aboutMe":
      icon = <Info />;
      break;

    case "experience":
      icon = <WorkHistory />;
      break;

    case "tools":
      icon = <Build />;
      break;

    case "contact":
      icon = <Message />;
      break;

    default:
      icon = <QuestionMark />;
      break;
  };

  return icon;
};

/**
 * Maps a portfolio section key to its page component.
 */
export const mapSectionKeyToComponent = (sectionKey: string) => {
  let component = null;

  switch (sectionKey) {
    case "aboutMe":
      component = <AboutMeSection />;
      break;

    case "experience":
      component = <ExperienceSection />;
      break;

    case "tools":
      component = <ToolsSection />;
      break;

    case "contact":
      component = <ContactSection />;
      break;

    default:
      break;
  };

  return component;
};
