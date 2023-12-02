import React, { useEffect, useRef, useState } from "react";
import Section from "../components/pages/Home/Section";
import { HOME_SECTIONS } from "../constants";
import { mapSectionKeyToComponent } from "../utils/homeSectionMappers";
import Background from "../components/pages/Home/Background";
import { Box } from "@mui/material";

/**
 * Homepage of the site.
 */
const Home = () => {
  const homeRef = useRef<HTMLDivElement>();
  const [homeHeight, setHomeHeight] = useState<number>(0);

  useEffect(() => {
    if (homeRef.current) {
      setHomeHeight(homeRef.current.offsetHeight);
    }
  }, [homeRef]);

  return (
    <Box
      ref={homeRef}
    >
      <Background
        height={homeHeight}
      />
      {Object.entries(HOME_SECTIONS).map(([sectionKey, sectionRoute]) => (
        <Section
          id={sectionRoute}
          key={sectionKey}
        >
          {mapSectionKeyToComponent(sectionKey)}
        </Section>
      ))}
    </Box>
  );
};

export default Home;
