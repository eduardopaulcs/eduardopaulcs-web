import { Button } from "@mui/material";

interface TimelineCardProps {
  children: React.ReactNode;
  action?: () => void;
};

const TimelineCard = ({
  children,
  action,
}: TimelineCardProps) => {
  const handleCardClick = () => {
    if (!action) {
      return;
    }

    action();
  };

  return (
    <Button
      onClick={handleCardClick}
      disabled={!action}
      sx={{
        backgroundColor: "secondary.main",
        "&:hover": {
          backgroundColor: "secondary.main",
        },
        color: "text.primary",
        "&.Mui-disabled": {
          color: "text.primary",
        },
        padding: "1rem",
        borderRadius: 0,
      }}
    >
      {children}
    </Button>
  );
};

export default TimelineCard;
