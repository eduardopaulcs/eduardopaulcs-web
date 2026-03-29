import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useState } from "react";
import BlogDateFilter from "../components/pages/Blog/BlogDateFilter";
import BlogPostCard from "../components/pages/Blog/BlogPostCard";
import BlogTitleFilter from "../components/pages/Blog/BlogTitleFilter";
import useTranslation from "../hooks/useTranslation";
import useBlogPosts from "../hooks/useBlogPosts";
import normalize from "../utils/normalize";
import useDocumentTitle from "../hooks/useDocumentTitle";

/**
 * Returns true if all whitespace-separated tokens in query appear in title.
 * Case-insensitive and accent-insensitive.
 */
const matchesTitle = (title: string, query: string): boolean => {
  if (!query.trim()) return true;
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const normalizedTitle = normalize(title);
  return tokens.every((token) => normalizedTitle.includes(token));
};

/**
 * Blog list page. Fetches post metadata and displays filterable post cards.
 */
const Blog = () => {
  const { t } = useTranslation();
  const { posts, loading, error } = useBlogPosts();
  useDocumentTitle(t("pages.blog.title"));
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [titleFilter, setTitleFilter] = useState<string>("");

  const filteredPosts = posts
    .filter((p) => yearFilter === "all" || p.date.startsWith(yearFilter))
    .filter((p) => matchesTitle(p.title, titleFilter));

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 4, px: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t("pages.blog.title")}
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {error && (
        <Typography color="error">{error}</Typography>
      )}

      {!loading && !error && (
        <>
          <Stack gap={2} sx={{ my: 3 }}>
            <BlogTitleFilter value={titleFilter} onChange={setTitleFilter} />
            <BlogDateFilter posts={posts} value={yearFilter} onChange={setYearFilter} />
          </Stack>

          {filteredPosts.length === 0 ? (
            <Typography color="text.secondary">
              {t("pages.blog.noPostsFound")}
            </Typography>
          ) : (
            filteredPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))
          )}
        </>
      )}
    </Box>
  );
};

export default Blog;
