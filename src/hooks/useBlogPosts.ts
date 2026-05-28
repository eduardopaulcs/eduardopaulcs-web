import { useEffect, useState } from "react";
import getEnvVariable from "../utils/getEnvVariable";

/** Metadata for a single blog post, sourced from public/blog/index.json. */
export type BlogPostMeta = {
  id: string;
  title: string;
  date: string;
  preview: string;
  /** BCP 47 language tag for the post content (e.g. "en", "es"). */
  lang?: string;
};

let cachedPosts: BlogPostMeta[] | null = null;
let pendingFetch: Promise<BlogPostMeta[]> | null = null;

/**
 * Fetches the list of blog post metadata from public/blog/index.json.
 * Uses a module-level cache so concurrent callers share a single request.
 * Returns posts in the order defined in the file (newest-first by convention).
 */
const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPostMeta[]>(cachedPosts ?? []);
  const [loading, setLoading] = useState(cachedPosts === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedPosts !== null) return;

    if (pendingFetch === null) {
      pendingFetch = fetch(`${getEnvVariable("PUBLIC_URL", "", true)}/blog/index.json`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load blog index (${res.status})`);
          return res.json() as Promise<BlogPostMeta[]>;
        })
        .then((data) => { cachedPosts = data; return data; });
    }

    pendingFetch
      .then((data) => { setPosts(data); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, []);

  return { posts, loading, error };
};

export default useBlogPosts;
