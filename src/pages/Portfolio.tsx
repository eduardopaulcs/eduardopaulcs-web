import { useEffect, useRef, useState } from "react";
import Section from "../components/pages/Portfolio/Section";
import { PORTFOLIO_SECTIONS } from "../constants";
import { mapSectionKeyToComponent } from "../utils/portfolioSectionMappers";
import Background from "../components/common/Background";
import { Box } from "@mui/material";

/**
 * Portfolio page of the site.
 */
const Portfolio = () => {
  const portfolioRef = useRef<HTMLDivElement>(null);
  const [portfolioHeight, setPortfolioHeight] = useState(0);

  useEffect(() => {
    const node = portfolioRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPortfolioHeight(entry.target.scrollHeight);
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={portfolioRef}
    >
      <Background
        totalHeight={portfolioHeight}
      />
      {Object.entries(PORTFOLIO_SECTIONS).map(([sectionKey, sectionRoute]) => (
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

export default Portfolio;
