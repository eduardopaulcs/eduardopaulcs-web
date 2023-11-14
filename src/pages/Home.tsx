import React from "react";
import Section from "../components/pages/Home/Section";
import { HOME_SECTIONS } from "../constants";

/**
 * Homepage of the site.
 */
const Home = () => {
  return (
    <>
      {HOME_SECTIONS.map((section) => (
        <Section
          id={section}
          key={section}
        >
          {section}
        </Section>
      ))}
    </>
  );
};

export default Home;
