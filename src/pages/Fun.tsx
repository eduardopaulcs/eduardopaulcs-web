import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useState } from "react";
import GameCard from "../components/pages/Fun/GameCard";
import GameSearchFilter from "../components/pages/Fun/GameSearchFilter";
import useTranslation from "../hooks/useTranslation";
import useFunGames from "../hooks/useFunGames";
import normalize from "../utils/normalize";

/**
 * Returns true if all whitespace-separated tokens in query appear in name.
 * Case-insensitive and accent-insensitive.
 */
const matchesName = (name: string, query: string): boolean => {
  if (!query.trim()) return true;
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const normalizedName = normalize(name);
  return tokens.every((token) => normalizedName.includes(token));
};

/**
 * Fun page. Displays a searchable gallery of mini-games.
 */
const Fun = () => {
  const { t } = useTranslation();
  const { games, loading, error } = useFunGames();
  const [searchFilter, setSearchFilter] = useState<string>("");

  const filteredGames = games.filter((g) =>
    matchesName(t(`pages.fun.games.${g.id}.name`), searchFilter)
  );

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: 4, px: 2 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t("pages.fun.title")}
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
          <Box sx={{ my: 3 }}>
            <GameSearchFilter value={searchFilter} onChange={setSearchFilter} />
          </Box>

          {filteredGames.length === 0 ? (
            <Typography color="text.secondary">
              {t("pages.fun.noGamesFound")}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredGames.map((game) => (
                <Grid item xs={12} sm={6} md={4} key={game.id}>
                  <GameCard game={game} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default Fun;
