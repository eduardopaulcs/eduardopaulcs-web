import React from "react";
import { List, ListItem, ListItemButton, ListItemIcon } from "@mui/material";

interface NavbarListProps {
  items: {
    action: () => void;
    icon: JSX.Element;
  }[];
};

/**
 * List used in the site's navbar.
 */
const NavbarList = ({
  items,
}: NavbarListProps) => {
  return (
    <List>
      {items.map((item, idx) => (
        <ListItem
          key={idx}
          disablePadding
        >
          <ListItemButton
            onClick={item.action}
          >
            <ListItemIcon
              sx={{
                justifyContent: "center",
                minWidth: "initial",
              }}
            >
              {item.icon}
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default NavbarList;
