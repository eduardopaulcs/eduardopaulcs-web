import React from "react";
import Section from "../components/pages/Home/Section";
import { HOME_SECTIONS } from "../constants";
import CoverSection from "../components/pages/Home/CoverSection";
import AboutMeSection from "../components/pages/Home/AboutMeSection";
import ContactSection from "../components/pages/Home/ContactSection";

/**
 * Homepage of the site.
 */
const Home = () => {
  /**
   * Returns the component related to the specified section.
   */
  const renderSection = (section: string) => {
    switch (section) {
      case "inicio":
        return <CoverSection />;

      case "sobre-mi":
        return <AboutMeSection />;

      case "contacto":
        return <ContactSection />;

      default:
        return null;
    }
  };

  return (
    <>
      {HOME_SECTIONS.map((section) => (
        <Section
          id={section}
          key={section}
        >
          {renderSection(section)}
        </Section>
      ))}
    </>
  );
};

export default Home;
