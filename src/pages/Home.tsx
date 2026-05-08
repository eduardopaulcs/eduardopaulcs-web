import { useEffect, useRef, useState } from "react";
import Section from "../components/pages/Home/Section";
import { HOME_SECTIONS } from "../constants";
import { mapSectionKeyToComponent } from "../utils/homeSectionMappers";
import Background from "../components/pages/Home/Background";
import { Box } from "@mui/material";

/**
 * Homepage of the site.
 */
const Home = () => {
  const homeRef = useRef<HTMLDivElement>(null);
  const [homeHeight, setHomeHeight] = useState(0);

  useEffect(() => {
    const node = homeRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHomeHeight(entry.target.scrollHeight);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
