import { Box, CircularProgress, Divider, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import useBlogPost from "../../../hooks/useBlogPost";
import { BlogPostMeta } from "../../../hooks/useBlogPosts";
import useTranslation from "../../../hooks/useTranslation";

interface BlogPostDetailProps {
  post: BlogPostMeta;
}

/**
 * Renders the full content of a blog post.
 * Fetches the markdown file and renders it with MUI-styled typography.
 */
const BlogPostDetail = ({ post }: BlogPostDetailProps) => {
  const { currentLang } = useTranslation();
  const { content, loading, error } = useBlogPost(post);

  const formattedDate = new Date(`${post.date}T00:00:00`).toLocaleDateString(
    currentLang,
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 4, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {post.title}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
        {formattedDate}
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && (
        <Typography color="error">{error}</Typography>
      )}

      {content && (
        <Box lang={post.lang}>
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <Typography variant="h4" component="h1" gutterBottom mt={4}>{children}</Typography>
            ),
            h2: ({ children }) => (
              <Typography variant="h5" component="h2" gutterBottom mt={3}>{children}</Typography>
            ),
            h3: ({ children }) => (
              <Typography variant="h6" component="h3" gutterBottom mt={2}>{children}</Typography>
            ),
            p: ({ children }) => (
              <Typography variant="body1" paragraph>{children}</Typography>
            ),
            li: ({ children }) => (
              <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>{children}</Typography>
            ),
            ul: ({ children }) => (
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>{children}</Box>
            ),
            ol: ({ children }) => (
              <Box component="ol" sx={{ pl: 3, mb: 2 }}>{children}</Box>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.startsWith("language-");
              return isBlock ? (
                <Box
                  component="pre"
                  sx={(theme) => ({
                    backgroundColor: "action.hover",
                    borderRadius: 1,
                    p: 2,
                    mb: 2,
                    overflowX: "auto",
                    fontFamily: theme.typography.h1.fontFamily,
                    fontSize: "0.875rem",
                  })}
                >
                  <code>{children}</code>
                </Box>
              ) : (
                <Box
                  component="code"
                  sx={(theme) => ({
                    backgroundColor: "action.hover",
                    borderRadius: 0.5,
                    px: 0.75,
                    py: 0.25,
                    fontFamily: theme.typography.h1.fontFamily,
                    fontSize: "0.875em",
                  })}
                >
                  {children}
                </Box>
              );
            },
            hr: () => <Divider sx={{ my: 3 }} />,
            a: ({ href, children }) => (
              <Box
                component="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "text.primary" }}
              >
                {children}
              </Box>
            ),
            blockquote: ({ children }) => (
              <Box
                component="blockquote"
                sx={{
                  borderLeft: 4,
                  borderColor: "primary.main",
                  pl: 2,
                  ml: 0,
                  my: 2,
                  color: "text.secondary",
                }}
              >
                {children}
              </Box>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        </Box>
      )}
    </Box>
  );
};

export default BlogPostDetail;
