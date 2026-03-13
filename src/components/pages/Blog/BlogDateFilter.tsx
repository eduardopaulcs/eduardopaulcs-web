import { Button, Stack } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";
import { BlogPostMeta } from "../../../hooks/useBlogPosts";

interface BlogDateFilterProps {
  posts: BlogPostMeta[];
  value: string;
  onChange: (year: string) => void;
}

/**
 * Year-based filter for the blog list page.
 * Renders "All" and each available year as toggle buttons styled consistently
 * with the site's TimelineCard button pattern.
 */
const BlogDateFilter = ({ posts, value, onChange }: BlogDateFilterProps) => {
  const { t } = useTranslation();

  const years = Array.from(
    new Set(posts.map((p) => p.date.substring(0, 4)))
  ).sort((a, b) => b.localeCompare(a));

  if (years.length <= 1) return null;

  const options = [{ label: t("pages.blog.allYears"), value: "all" }, ...years.map((y) => ({ label: y, value: y }))];

  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <Button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            sx={isSelected ? {
              backgroundColor: "secondary.main",
              color: "text.primary",
              borderRadius: 0,
              "&:hover": { backgroundColor: "secondary.main" },
            } : {
              backgroundColor: "transparent",
              color: "text.secondary",
              borderRadius: 0,
              border: "1px solid",
              borderColor: "secondary.dark",
              "&:hover": { backgroundColor: "secondary.dark" },
            }}
          >
            {opt.label}
          </Button>
        );
      })}
    </Stack>
  );
};

export default BlogDateFilter;
