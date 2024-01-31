import { cloneElement } from "react";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";
import { useState } from "react";
import getEnvVariable from "../../../utils/getEnvVariable";
import { CONTACT_MEANS } from "../../../constants";
import { mapContactMeanToIcon } from "../../../utils/contactMeanMappers";
import { Link } from "react-router-dom";
import Modal from "../../common/Modal";

type ContactLink = {
  key: string;
  link: string;
  icon: JSX.Element;
  isEmail: boolean;
};

const contactLinks: ContactLink[] = [];

Object.entries(CONTACT_MEANS).forEach(([linkKey, envVariable]) => {
  const link = getEnvVariable(envVariable);
  // Check we got a valid link
  if (typeof link !== "string") {
    return;
  }

  // Add contact mean to the links list
  contactLinks.push({
    key: linkKey,
    link: link,
    icon: mapContactMeanToIcon(linkKey),
    isEmail: (linkKey === "email"),
  });
});

const ContactSection = () => {
  const {t} = useTranslation();

  const [emailLinkModalInfo, setEmailLinkModalInfo] = useState<ContactLink | null>(null);
  const [emailLinkModalOpen, setEmailLinkModalOpen] = useState<boolean>(false);

  /**
   * Opens the modal when we have an email link.
   */
  const openEmailLinkModal = (contactLink: ContactLink) => {
    setEmailLinkModalInfo(contactLink);
    setEmailLinkModalOpen(true);
  };

  /**
   * Closes the email link modal.
   */
  const closeEmailLinkModal = () => {
    setEmailLinkModalOpen(false);
  };

  /**
   * Get items to display in the contact list.
   */
  const getContactListItems = () => {
    return contactLinks.map((contactLink, idx) => {
      const listItemButton = (contactLink.isEmail)
        ? <ListItemButton onClick={() => openEmailLinkModal(contactLink)} />
        : <ListItemButton component={Link} to={contactLink.link} target="_blank" rel="noopener noreferrer" />;

      return (
        <ListItem
          disablePadding
          key={idx}
        >
          {cloneElement(listItemButton, {
            children: (
              <>
                <ListItemIcon>
                  {contactLink.icon}
                </ListItemIcon>
                <ListItemText primary={t(`pages.home.sections.contact.links.${contactLink.key}`)} />
              </>
            ),
            sx: {
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }
          })}
        </ListItem>
      );
    });
  };

  /**
   * Renders the email link modal content. If no emailLinkModalInfo is set, it
   * displays nothing.
   */
  const renderEmailLinkModalContent = () => {
    if (emailLinkModalInfo === null) {
      return <></>;
    }

    return (
      <Stack gap={2}>
        <Typography
          id="email-link-modal-title"
          variant="h6"
          component="h2"
        >
          {t(`pages.home.sections.contact.links.${emailLinkModalInfo.key}`)}
        </Typography>
        <Typography>
          {emailLinkModalInfo.link}
        </Typography>
      </Stack>
    );
  };

  return (
    <Box
      sx={{
        margin: "auto",
      }}
    >
      <Stack
        spacing={4}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: "bold",
          }}
        >
          {t("pages.home.sections.contact.title")}
        </Typography>
        <List>
          {getContactListItems()}
        </List>
      </Stack>
      <Modal
        open={emailLinkModalOpen}
        onClose={closeEmailLinkModal}
        aria-labelledby="email-link-modal-title"
      >
        {renderEmailLinkModalContent()}
      </Modal>
    </Box>
  );
};

export default ContactSection;
