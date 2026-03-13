import { useEffect, useState } from "react";
import { BlogPostMeta } from "./useBlogPosts";
import getEnvVariable from "../utils/getEnvVariable";

/**
 * Fetches the markdown content of a single blog post.
 * The file is resolved from public/blog/posts/{date}-{id}.md.
 */
const useBlogPost = (post: BlogPostMeta) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filePath = `${getEnvVariable("PUBLIC_URL", "", true)}/blog/posts/${post.date}-${post.id}.md`;

    fetch(filePath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [post.id, post.date]);

  return { content, loading, error };
};

export default useBlogPost;
