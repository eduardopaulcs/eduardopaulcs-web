import React from "react";
import { Grid, styled, useMediaQuery, useTheme } from "@mui/material";
import TimelineCard from "./TimelineCard";
import TimelineTip from "./TimelineTip";
import TimelineLine from "./TimelineLine";
import TimelineDot from "./TimelineDot";
import TimelineArrow from "./TimelineArrow";

type TimelineItemChild = React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;

interface TimelineItemProps {
  children?: React.ReactNode;
  reverse?: boolean;
  align?: "start" | "center" | "end";
  isDownArrow?: boolean;
  isUpArrow?: boolean;
};

const StyledLi = styled("li")<TimelineItemProps>(() => ({
  display: "flex",
  flexDirection: "row",
  width: "100%",
}));

/**
 * One row of the vertical Timeline component.
 */
const TimelineItem = ({
  children,
  reverse = false,
  align = "start",
  isDownArrow = false,
  isUpArrow = false,
}: TimelineItemProps) => {
  const processedChildren = React.Children.toArray(children);
  const cards: TimelineItemChild[] = [];
  const tips: TimelineItemChild[] = [];

  const theme = useTheme();
  const showTwoColumns = useMediaQuery(theme.breakpoints.down("sm"));
  const shouldReverse = (showTwoColumns ? true : reverse);

  if (!isDownArrow && !isUpArrow) {
    // Map every children to cards or tips
    processedChildren.forEach((child) => {
      if (!React.isValidElement(child)) {
        return;
      }

      switch (child.type) {
        case TimelineCard:
          cards.push(child);
          break;

        case TimelineTip:
          tips.push(child);
          break;

        default:
          break;
      }
    });
  }

  /**
   * Renders the center column that contains the event dots.
   */
  const renderCenterColumn = () => {
    if (!isDownArrow && !isUpArrow) {
      return (
        <Grid
          item
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: ".75rem",
          }}
          aria-hidden
        >
          <TimelineLine
            maxHeight={(align === "start") ? "1rem" : undefined}
          />
          <TimelineDot />
          <TimelineLine
            maxHeight={(align === "end") ? "1rem" : undefined}
          />
        </Grid>
      );
    }

    return (
      <Grid
        item
        sx={{
          display: "flex",
          flexDirection: (isDownArrow ? "column" : "column-reverse"),
          alignItems: "center",
          justifyContent: "start",
          height: "100%",
          width: ".75rem",
        }}
        aria-hidden
      >
        <TimelineLine
          maxHeight="1rem"
        />
        <TimelineArrow
          direction={isDownArrow ? "down" : "up"}
        />
      </Grid>
    );
  };

  return (
    <StyledLi>
      <Grid
        container
        direction={shouldReverse ? "row-reverse" :  "row"}
        alignItems={align}
        justifyContent="center"
        spacing={0}
      >
        <Grid
          item
          sx={{
            flex: "1",
            padding: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: (shouldReverse ? "start" : "end"),
            gap: ".5rem",
          }}
        >
          {(showTwoColumns && tips.length > 0) && tips[0]}
          {cards.length > 0 && cards[0]}
        </Grid>
        {renderCenterColumn()}
        {!showTwoColumns && (
          <Grid
            item
            sx={{
              flex: "1",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: (shouldReverse ? "end" : "start"),
              gap: ".5rem",
            }}
          >
            {tips.length > 0 && tips[0]}
          </Grid>
        )}
      </Grid>
    </StyledLi>
  );
};

export default TimelineItem;
