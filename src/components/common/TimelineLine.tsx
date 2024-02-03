import { Box } from "@mui/material";

interface TimelineLineProps {
  maxHeight?: string;
};

/**
 * A single line for the vertical Timeline.
 */
const TimelineLine = ({
  maxHeight,
}: TimelineLineProps) => {
  return (
    <Box
      sx={{
        flex: "1",
        backgroundColor: "secondary.main",
        width: "3px",
        maxHeight: (maxHeight ? maxHeight : "initial"),
        margin: "0 auto",
      }}
    />
  );
};

export default TimelineLine;
