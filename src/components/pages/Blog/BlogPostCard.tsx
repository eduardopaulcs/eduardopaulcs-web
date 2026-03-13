import { Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useTranslation from "../../../hooks/useTranslation";
import { BlogPostMeta } from "../../../hooks/useBlogPosts";
import relativeToAbsolutePath from "../../../utils/relativeToAbsolutePath";

interface BlogPostCardProps {
  post: BlogPostMeta;
}

/**
 * Card component for a single blog post entry in the list page.
 * Displays the post title, date, preview text, and a "Read more" link.
 */
const BlogPostCard = ({ post }: BlogPostCardProps) => {
  const { currentLang } = useTranslation();
  const navigate = useNavigate();

  const formattedDate = new Date(`${post.date}T00:00:00`).toLocaleDateString(
    currentLang,
    { year: "numeric", month: "long", day: "numeric" }
  );

  const handleClick = () => {
    navigate(relativeToAbsolutePath(`blog/${post.id}`, currentLang));
  };

  return (
    <Card
      lang={post.lang}
      sx={(theme) => ({
        mb: 2,
        borderRadius: 0,
        backgroundColor: "primary.dark",
        transition: "background-color 0.2s",
        "&:hover": { backgroundColor: theme.palette.primary.main },
      })}
    >
      <CardActionArea onClick={handleClick}>
        <CardContent sx={{ padding: 3, "&:last-child": { paddingBottom: 3 } }}>
          <Stack gap={0.5} mb={1.5}>
            <Typography variant="h6" component="h2">
              {post.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {post.preview}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BlogPostCard;
