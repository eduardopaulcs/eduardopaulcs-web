import React, { cloneElement } from "react";
import { styled } from "@mui/material";
import TimelineItem from "./TimelineItem";

type TimelineChild = React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;

interface TimelineProps {
  children: React.ReactNode;
  alternate?: boolean;
  reverse?: boolean;
  downArrow?: boolean;
  upArrow?: boolean;
};

const StyledUl = styled("ul")<TimelineProps>(() => ({
  display: "flex",
  flexDirection: "column",
  margin: 0,
  padding: 0,
  listStyleType: "none",
  alignItems: "center",
  justifyContent: "start",
}));

/**
 * Custom implementation of the Timeline component of the MUI Lab.
 */
const Timeline = ({
  children,
  alternate = false,
  reverse = false,
  downArrow = true,
  upArrow = false,
}: TimelineProps) => {
  const processedChildren = React.Children.toArray(children);
  const items: TimelineChild[] = [];

  // Map every children to an item
  processedChildren.forEach((child, idx) => {
    if (!React.isValidElement(child)) {
      return;
    }

    switch (child.type) {
      case TimelineItem:
        // If this item should be reversed
        if (
          (alternate && reverse === (idx % 2 === 0)) ||
          (!alternate && reverse)
        ) {
          // HACK!! "any" because we can't set reverse otherwise
          child = cloneElement(child as any, {reverse: true});
        }
        items.push(child);
        break;

      default:
        break;
    }
  });

  return (
    <StyledUl>
      {upArrow && (
        <TimelineItem
          isUpArrow
        />
      )}
      {items}
      {downArrow && (
        <TimelineItem
          isDownArrow
        />
      )}
    </StyledUl>
  );
};

export default Timeline;
