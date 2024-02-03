import { Box, Theme } from "@mui/material";

interface TimelineArrowProps {
  direction: "up" | "down";
};

/**
 * One of the arrows used at the end of the vertical Timeline.
 */
const TimelineArrow = ({
  direction = "down",
}: TimelineArrowProps) => {
  return (
    <Box
      aria-hidden
      sx={(theme: Theme) => ({
        transform: (direction === "up" ? "rotate(180deg)" : ""),
        display: "block",
        width: 0,
        height: 0,
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
        borderTop: `6px solid ${theme.palette.secondary.main}`,
      })}
    />
  );
};

export default TimelineArrow;
