import React, { useState } from "react";
import { Collapse, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

interface NavbarListItemProps {
  action?: () => void;
  icon?: JSX.Element;
  text?: string;
  children?: React.ReactNode;
};

/**
 * One of the items used in NavbarList.
 */
const NavbarListItem = ({
  action,
  icon,
  text,
  children,
}: NavbarListItemProps) => {
  const [open, setOpen] = useState<boolean>(false);

  /**
   * Handles the click event on the ListItemButton.
   */
  const handleButtonClick = () => {
    if (children) {
      setOpen(!open);
    } else if (action) {
      action();
    }
  };

  return (
    <ListItem
      disablePadding
    >
      {(action || children) && (
        <ListItemButton
          onClick={handleButtonClick}
        >
          {icon && (
            <ListItemIcon
              sx={{
                justifyContent: "center",
                minWidth: "initial",
              }}
            >
              {icon}
            </ListItemIcon>
          )}
          {text && (
            <ListItemText>
              {text}
            </ListItemText>
          )}
        </ListItemButton>
      )}
      {children && (
        <Collapse
          in={open}
          unmountOnExit
        >
          {children}
        </Collapse>
      )}
    </ListItem>
  );
};

export default NavbarListItem;
