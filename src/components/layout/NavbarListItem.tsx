import { Collapse, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

interface NavbarListItemProps {
  action: () => void;
  icon?: JSX.Element;
  label?: string;
  text?: string;
  children?: React.ReactNode;
  open?: boolean;
};

/**
 * One of the items used in NavbarList.
 */
const NavbarListItem = ({
  action,
  icon,
  label,
  text,
  children,
  open,
}: NavbarListItemProps) => {
  /**
   * Handles the click event on the ListItemButton.
   */
  const handleButtonClick = () => {
    action();
  };

  return (
    <ListItem
      disablePadding
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ListItemButton
        onClick={handleButtonClick}
        aria-label={label}
        sx={(theme) => ({
          padding: 0,
          "& > .MuiListItemIcon-root": {
            transition: "transform 0.2s ease-out",
          },
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "transparent",
            "& > .MuiListItemIcon-root": {
              transform: "scale(1.3)",
            },
          },
          width: theme.custom.components.navbar.width,
          height: theme.custom.components.navbar.width,
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        {icon && (
          <ListItemIcon
            aria-hidden
            sx={{
              justifyContent: "center",
              minWidth: "initial",
            }}
          >
            {icon}
          </ListItemIcon>
        )}
        {text && (
          <ListItemText
            sx={{
              textAlign: "center",
            }}
          >
            {text}
          </ListItemText>
        )}
      </ListItemButton>
      {children && (
        <Collapse
          in={open || false}
          unmountOnExit
          sx={{
            backgroundColor: "rgba(255, 255, 255, .1)",
          }}
        >
          {children}
        </Collapse>
      )}
    </ListItem>
  );
};

export default NavbarListItem;
