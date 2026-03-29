import { useEffect, useState } from "react";
import getEnvVariable from "../utils/getEnvVariable";

export type GamePlatform = "desktop" | "mobile" | "any";

export type GameMeta = {
  id: string;
  platform: GamePlatform;
};

let cachedGames: GameMeta[] | null = null;
let pendingFetch: Promise<GameMeta[]> | null = null;

/**
 * Fetches the list of game metadata from public/fun/index.json.
 * Uses a module-level cache so concurrent callers share a single request.
 * Returns games in the order defined in the file.
 */
const useFunGames = () => {
  const [games, setGames] = useState<GameMeta[]>(cachedGames ?? []);
  const [loading, setLoading] = useState(cachedGames === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedGames !== null) return;

    if (pendingFetch === null) {
      pendingFetch = fetch(`${getEnvVariable("PUBLIC_URL", "", true)}/fun/index.json?v=${getEnvVariable("BUILD_ID")}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load games list (${res.status})`);
          return res.json() as Promise<GameMeta[]>;
        })
        .then((data) => { cachedGames = data; return data; });
    }

    pendingFetch
      .then((data) => { setGames(data); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, []);

  return { games, loading, error };
};

export default useFunGames;
