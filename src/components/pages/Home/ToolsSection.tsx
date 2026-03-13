import { Box, Grid, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";
import useTranslationArray from "../../../hooks/useTranslationArray";

type ToolCategoryTranslation = {
  title: string;
  items: string[];
};

/**
 * Tools section of the portfolio page. Shows a categorized grid of skills and technologies.
 */
const ToolsSection = () => {
  const {t} = useTranslation();
  const tools = useTranslationArray<string>("pages.home.sections.aboutMe.tools.description");
  const toolCategories = useTranslationArray<ToolCategoryTranslation>("pages.home.sections.aboutMe.tools.categories");

  return (
    <Box
      sx={{
        marginTop: "auto",
        marginBottom: "auto",
      }}
    >
      <Stack spacing={4}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: "bold",
          }}
        >
          {t("pages.home.sections.aboutMe.tools.title")}
        </Typography>
        <Stack spacing={2}>
          {tools.map((paragraph, idx) => (
            <Typography key={idx}>
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
    </Box>
  );
};

export default ToolsSection;
