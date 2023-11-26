import React from "react";
import { List } from "@mui/material";

interface NavbarListProps {
  children: React.ReactNode;
};

/**
 * List used in the site's navbar.
 */
const NavbarList = ({
  children,
}: NavbarListProps) => {
  return (
    <List>
      {children}
    </List>
  );
};

export default NavbarList;
