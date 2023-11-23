import React from "react";
import { Box } from "@mui/material";

interface SectionProps {
  id: string;
  children?: React.ReactNode;
};

/**
 * One section of the homepage, it typically is the same height of the screen
 * at least.
 */
const Section = ({
  id,
  children,
}: SectionProps) => {
  return (
    <Box
      id={id}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        paddingTop: "1rem",
        paddingBottom: "1rem",
        minHeight: "100vh",
      }}
    >
      {children}
    </Box>
  );
};

export default Section;
