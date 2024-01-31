import { Home, Message, Person, QuestionMark } from "@mui/icons-material";
import CoverSection from "../components/pages/Home/CoverSection";
import AboutMeSection from "../components/pages/Home/AboutMeSection";
import ContactSection from "../components/pages/Home/ContactSection";

export const mapSectionKeyToIcon = (sectionKey: string) => {
  let icon = null;

  switch (sectionKey) {
    case "cover":
      icon = <Home />;
      break;

    case "aboutMe":
      icon = <Person />;
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

export const mapSectionKeyToComponent = (sectionKey: string) => {
  let component = null;

  switch (sectionKey) {
    case "cover":
      component = <CoverSection />;
      break;

    case "aboutMe":
      component = <AboutMeSection />;
      break;

    case "contact":
      component = <ContactSection />;
      break;

    default:
      break;
  };

  return component;
};
