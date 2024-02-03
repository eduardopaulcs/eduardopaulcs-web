import { Box, Grid, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";
import { useState } from "react";
import Timeline from "../../common/Timeline";
import TimelineItem from "../../common/TimelineItem";
import TimelineTip from "../../common/TimelineTip";
import TimelineCard from "../../common/TimelineCard";
import Modal from "../../common/Modal";
import useTranslationArray from "../../../hooks/useTranslationArray";

type TimelineItemTranslation = {
  title: string;
  description: string | string[];
  date?: string;
};

type ToolCategoryTranslation = {
  title: string;
  items: string[];
};

const AboutMeSection = () => {
  const {t} = useTranslation();
  const aboutMe = useTranslationArray<string>("pages.home.sections.aboutMe.description");
  const timeline = useTranslationArray<string>("pages.home.sections.aboutMe.timeline.description");
  const future = useTranslationArray<string>("pages.home.sections.aboutMe.future.description");
  const tools = useTranslationArray<string>("pages.home.sections.aboutMe.tools.description");
  const timelineItems = useTranslationArray<TimelineItemTranslation>("pages.home.sections.aboutMe.timeline.items");
  const toolCategories = useTranslationArray<ToolCategoryTranslation>("pages.home.sections.aboutMe.tools.categories");

  const [timelineItemModalInfo, setTimelineItemModalInfo] = useState<TimelineItemTranslation | null>(null);
  const [timelineItemModalOpen, setTimelineItemModalOpen] = useState<boolean>(false);

  /**
   * Opens the timeline item modal.
   */
  const openTimelineItemModal = (timelineItem: TimelineItemTranslation) => {
    setTimelineItemModalInfo(timelineItem);
    setTimelineItemModalOpen(true);
  };

  /**
   * Closes the timeline item modal.
   */
  const closeTimelineItemModal = () => {
    setTimelineItemModalOpen(false);
  };

  /**
   * Renders the timeline item modal content.
   */
  const renderTimelineItemModalContent = () => {
    if (timelineItemModalInfo === null) {
      return <></>;
    }

    const itemDescription = (Array.isArray(timelineItemModalInfo.description))
      ? timelineItemModalInfo.description
      : [timelineItemModalInfo.description];

    return (
      <Stack gap={2}>
        <Typography
          id="timeline-item-modal-title"
          variant="h6"
          component="h2"
        >
          {timelineItemModalInfo.title}
        </Typography>
        <Stack gap={1}>
          {itemDescription.map((paragraph, idx) => (
            <Typography
              key={idx}
            >
              {paragraph}
            </Typography>
          ))}
        </Stack>
      </Stack>
    );
  };

  return (
    <Box
      sx={{
        marginTop: "auto",
        marginBottom: "auto",
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
          {t("pages.home.sections.aboutMe.title")}
        </Typography>
        <Stack
          spacing={2}
        >
          {aboutMe.map((paragraph, idx) => (
            <Typography
              key={idx}
            >
              {paragraph}
            </Typography>
          ))}
        </Stack>
        <Stack
          spacing={2}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: "bold",
            }}
          >
            {t("pages.home.sections.aboutMe.timeline.title")}
          </Typography>
          {timeline.map((paragraph, idx) => (
            <Typography
              key={idx}
            >
              {paragraph}
            </Typography>
          ))}
          <Timeline
            alternate
          >
            {timelineItems.map((timelineItem, idx) => (
              <TimelineItem
                align="center"
                key={idx}
              >
                <TimelineCard
                  action={() => openTimelineItemModal(timelineItem)}
                >
                  <Typography
                    variant="h6"
                    component="h4"
                    fontSize="body2.fontSize"
                    textTransform="initial"
                    fontWeight="bold"
                  >
                    {timelineItem.title}
                  </Typography>
                </TimelineCard>
                {timelineItem.date && (
                  <TimelineTip>{timelineItem.date}</TimelineTip>
                )}
              </TimelineItem>
            ))}
          </Timeline>
        </Stack>
        <Stack
          spacing={2}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: "bold",
            }}
          >
            {t("pages.home.sections.aboutMe.future.title")}
          </Typography>
          {future.map((paragraph, idx) => (
            <Typography
              key={idx}
            >
              {paragraph}
            </Typography>
          ))}
        </Stack>
        <Stack
          spacing={2}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: "bold",
            }}
          >
            {t("pages.home.sections.aboutMe.tools.title")}
          </Typography>
          {tools.map((paragraph, idx) => (
            <Typography
              key={idx}
            >
              {paragraph}
            </Typography>
          ))}
          <Grid
            container
            alignItems="start"
            justifyContent="center"
            spacing={2}
          >
            {toolCategories.map((category, categoryIdx) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={categoryIdx}
              >
                <Typography
                  variant="h6"
                  component="h4"
                >
                  {category.title}
                </Typography>
                <List
                  sx={{
                    padding: "0 1.25rem",
                    listStyleType: "disc",
                  }}
                >
                  {category.items.map((item, itemIdx) => (
                    <ListItem
                      sx={{
                        display: "list-item"
                      }}
                      disablePadding
                      key={`${categoryIdx}-${itemIdx}`}
                    >
                      <ListItemText>{item}</ListItemText>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Stack>
      <Modal
        open={timelineItemModalOpen}
        onClose={closeTimelineItemModal}
        aria-labelledby="timeline-item-modal-title"
      >
        {renderTimelineItemModalContent()}
      </Modal>
    </Box>
  );
};

export default AboutMeSection;
