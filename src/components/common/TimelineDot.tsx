import { Box } from "@mui/material";

/**
 * A dot that represents an event on the vertical Timeline.
 */
const TimelineDot = () => {
  return (
    <Box
      sx={{
        backgroundColor: "secondary.main",
        width: "7px",
        height: "7px",
        margin: "2px auto",
        borderRadius: "100%",
      }}
    />
  );
};

export default TimelineDot;
