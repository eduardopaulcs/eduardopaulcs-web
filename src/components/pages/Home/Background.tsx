import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import bg1 from "../../../images/background/bg1.jpg";
import bg2 from "../../../images/background/bg2.jpg";
import bg3 from "../../../images/background/bg3.jpg";
import bg4 from "../../../images/background/bg4.jpg";
import bg5 from "../../../images/background/bg5.jpg";

interface BackgroundProps {
  totalHeight: number;
};

const bgImages = [bg1, bg2, bg3, bg4, bg5];

const getBackgroundHeight = (totalHeight: number) => {
  // Calculate background height
  let newBackgroundHeight = Math.ceil(totalHeight/2);
  // Cap minimum height to window height
  if (newBackgroundHeight < window.innerHeight) {
    newBackgroundHeight = window.innerHeight;
  }

  return newBackgroundHeight;
};

const getBackgroundScroll = () => {
  return -Math.floor(window.scrollY/4);
};

/**
 * Component to display the background image of the home page.
 */
const Background = ({
  totalHeight
}: BackgroundProps) => {
  const backgroundRef = useRef<HTMLDivElement>();
  const backgroundHeight = getBackgroundHeight(totalHeight);

  const [bgImage, setBgImage] = useState<string | null>(null);
  const [backgroundScroll, setBackgroundScroll] = useState<number>(getBackgroundScroll());

  useEffect(() => {
    setBgImage(bgImages[Math.floor(Math.random() * bgImages.length)]);
  }, []);

  /**
   * Handles window's scroll.
   */
  const handleScroll = () => {
    setBackgroundScroll(getBackgroundScroll());
  };

  useEffect(() => {
    // When the component loads

    window.addEventListener("scroll", handleScroll, {passive: true});

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: -50,
        overflow: "hidden",
        filter: "blur(8px)",
        backgroundColor: "background.default",
        backgroundImage: `url("${bgImage}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top",
        backgroundSize: "cover",
      }}
      style={{
        top: `${backgroundScroll}px`,
        height: `${backgroundHeight}px`,
      }}
      ref={backgroundRef}
    />
  );
};

export default Background;
