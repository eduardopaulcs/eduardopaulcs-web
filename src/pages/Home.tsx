import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import Section from "../components/pages/Home/Section";
import { HOME_SECTIONS } from "../constants";
import { mapSectionKeyToComponent } from "../utils/homeSectionMappers";
import Background from "../components/pages/Home/Background";
import { Box } from "@mui/material";

const getHomeHeight = (homeRef: MutableRefObject<HTMLDivElement | undefined>) => {
  if (homeRef.current) {
    return homeRef.current.offsetHeight;
  }

  return 0;
};

/**
 * Homepage of the site.
 */
const Home = () => {
  const homeRef = useRef<HTMLDivElement>();

  const [homeHeight, setHomeHeight] = useState<number>(getHomeHeight(homeRef));

  useEffect(() => {
    setHomeHeight(getHomeHeight(homeRef));
  }, [homeRef]);

  return (
    <Box
      ref={homeRef}
    >
      <Background
        totalHeight={homeHeight}
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
