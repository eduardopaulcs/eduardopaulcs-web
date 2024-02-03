import { Typography, type TypographyProps } from "@mui/material";

interface TimelineTipProps extends TypographyProps {
  children: string;
};

/**
 * Tip displayed on the side of a vertical Timeline. Usually used for dates.
 */
const TimelineTip = ({
  children,
  ...otherProps
}: TimelineTipProps) => {
  return (
    <Typography
      color="text.disabled"
      fontSize="caption.fontSize"
      {...otherProps}
    >
      {children}
    </Typography>
  );
};

export default TimelineTip;
