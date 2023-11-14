import React from "react";
import { Box } from "@mui/material";

interface SectionProps {
  id: string;
  children?: React.ReactNode;
};

const Section = ({
  id,
  children,
}: SectionProps) => {
  return (
    <Box
      id={id}
      sx={{
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
