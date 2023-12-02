import React, { useEffect, useRef, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { ReactComponent as Blob1 } from "../../../images/background/blob1.svg";
import { ReactComponent as Blob2 } from "../../../images/background/blob2.svg";
import { ReactComponent as Blob3 } from "../../../images/background/blob3.svg";
import { ReactComponent as Blob4 } from "../../../images/background/blob4.svg";
import { ReactComponent as Blob5 } from "../../../images/background/blob5.svg";

interface BackgroundProps {
  height: number;
};

const blobHeightFactor = 60;

/**
 * Component to display the background image of the home page.
 */
const Background = ({
  height
}: BackgroundProps) => {
  const backgroundRef = useRef<HTMLDivElement>();
  const [backgroundHeight, setBackgroundHeight] = useState<number>(Math.ceil(height/2));
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [randomBlobs, setRandomBlobs] = useState<JSX.Element[]>([]);
  const theme = useTheme();
  const primaryDarkColor = theme.palette.primary.dark;
  const lg = useMediaQuery(theme.breakpoints.up("lg"));
  const md = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const sm = useMediaQuery(theme.breakpoints.between("sm", "md"));

  useEffect(() => {
    // Executed when the component loads for the first time

    window.addEventListener("scroll", handleScroll, {passive: true});

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // When the background height changes

    const blobs = [Blob1, Blob2, Blob3, Blob4, Blob5];

    // Calculate background height
    let newBackgroundHeight = Math.ceil(height/2);
    // Cap minimum height to window height
    if (newBackgroundHeight < window.innerHeight) {
      newBackgroundHeight = window.innerHeight;
    }
    setBackgroundHeight(newBackgroundHeight);

    // Calculate number of blobs to use
    const numberOfBlobs = Math.ceil(newBackgroundHeight/blobHeightFactor);

    const selectedBlobs: JSX.Element[] = [];
    for (let i = 0; i < numberOfBlobs; i++) {
      // Select random blobs
      const randomIndex = Math.floor(Math.random() * blobs.length);
      const SelectedBlob = blobs[randomIndex];

      // Select random position
      const randomPosition = {
        x: -1,
        y: -1,
      };
      if (backgroundRef.current) {
        randomPosition["x"] = Math.floor(Math.random() * backgroundRef.current.offsetWidth);
        randomPosition["y"] = Math.floor(Math.random() * newBackgroundHeight);
      }

      // Select random angle
      const randomAngle = Math.floor(Math.random() * 360);

      // Select correct scale
      let scale = 150;
      if (sm) {
        scale = 115;
      } else if (md) {
        scale = 80;
      } else if (lg) {
        scale = 50;
      }

      // Add blob component to the list
      selectedBlobs.push(
        <SelectedBlob
          key={i}
          fill={primaryDarkColor}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: (randomPosition["y"] > -1) ? `${randomPosition["y"]}px` : "initial",
            left: (randomPosition["x"] > -1) ? `${randomPosition["x"]}px` : "initial",
            transform: `translate(-50%, -50%) rotate(${randomAngle}deg) scale(${scale}%)`
          }}
        />
      );
    }
    setRandomBlobs(selectedBlobs);
  }, [height, primaryDarkColor, backgroundRef, lg, md, sm]);

  /**
   * Handles the screen scroll.
   */
  const handleScroll = () => {
    setScrollPosition(-Math.floor(window.scrollY/4));
  };

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        zIndex: -50,
        overflow: "hidden",
        filter: {
          xs: "blur(8px)",
          sm: "blur(12px)",
          md: "blur(16px)",
          lg: "blur(24px)",
        },
      }}
      style={{
        top: scrollPosition,
        height: backgroundHeight,
      }}
      ref={backgroundRef}
    >
      {randomBlobs}
    </Box>
  );
};

export default Background;
