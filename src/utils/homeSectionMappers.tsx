import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import CoverSection from '../components/pages/Home/CoverSection';
import AboutMeSection from '../components/pages/Home/AboutMeSection';
import ContactSection from '../components/pages/Home/ContactSection';

export const mapSectionKeyToIcon = (sectionKey: string) => {
  let icon = null;

  switch (sectionKey) {
    case "cover":
      icon = <HomeIcon />;
      break;

    case "aboutMe":
      icon = <PersonIcon />;
      break;

    case "contact":
      icon = <MessageIcon />;
      break;

    default:
      icon = <QuestionMarkIcon />;
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
