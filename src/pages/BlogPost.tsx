import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlogPostDetail from "../components/pages/Blog/BlogPostDetail";
import useTranslation from "../hooks/useTranslation";
import useBlogPosts from "../hooks/useBlogPosts";
import relativeToAbsolutePath from "../utils/relativeToAbsolutePath";

/**
 * Individual blog post page.
 * Reads the :postId URL param, finds the matching post, and renders it.
 * Redirects to the blog list if the post is not found.
 */
const BlogPost = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { currentLang } = useTranslation();
  const { posts, loading } = useBlogPosts();

  const post = posts.find((p) => p.id === postId) ?? null;

  useEffect(() => {
    if (!loading && post === null) {
      navigate(relativeToAbsolutePath("blog", currentLang), { replace: true });
    }
  }, [loading, post, navigate, currentLang]);

  if (loading || post === null) return null;

  return <BlogPostDetail post={post} />;
};

export default BlogPost;
