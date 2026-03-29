import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlogPostDetail from "../components/pages/Blog/BlogPostDetail";
import useTranslation from "../hooks/useTranslation";
import useBlogPosts from "../hooks/useBlogPosts";
import relativeToAbsolutePath from "../utils/relativeToAbsolutePath";
import useDocumentTitle from "../hooks/useDocumentTitle";

/**
 * Adds or updates a <meta> tag by property attribute, creating it if absent.
 */
const setMetaProperty = (property: string, content: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

/**
 * Removes a <meta> tag by property attribute if it exists.
 */
const removeMetaProperty = (property: string) => {
  document.querySelector(`meta[property="${property}"]`)?.remove();
};

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

  useDocumentTitle(post?.title ?? null);

  useEffect(() => {
    if (!loading && post === null) {
      navigate(relativeToAbsolutePath("blog", currentLang), { replace: true });
    }
  }, [loading, post, navigate, currentLang]);

  useEffect(() => {
    if (post === null) return;

    setMetaProperty("og:type", "article");
    setMetaProperty("article:published_time", `${post.date}T00:00:00Z`);
    setMetaProperty("og:title", post.title);
    setMetaProperty("og:description", post.preview);
    setMetaProperty("og:url", window.location.href);
    if (post.lang != null) setMetaProperty("og:locale", post.lang);

    return () => {
      removeMetaProperty("og:type");
      removeMetaProperty("article:published_time");
      removeMetaProperty("og:title");
      removeMetaProperty("og:description");
      removeMetaProperty("og:url");
      removeMetaProperty("og:locale");
    };
  }, [post]);

  if (loading || post === null) return null;

  return <BlogPostDetail post={post} />;
};

export default BlogPost;
