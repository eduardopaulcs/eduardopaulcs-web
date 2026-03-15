import { Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import Computer from "@mui/icons-material/Computer";
import PhoneAndroid from "@mui/icons-material/PhoneAndroid";
import { useNavigate } from "react-router-dom";
import useTranslation from "../../../hooks/useTranslation";
import relativeToAbsolutePath from "../../../utils/relativeToAbsolutePath";
import { type GameMeta, type GamePlatform } from "../../../hooks/useFunGames";

interface GameCardProps {
  game: GameMeta;
}

/**
 * Returns a small icon for the game's platform restriction, or null if unrestricted.
 */
const PlatformIcon = ({ platform }: { platform: GamePlatform }) => {
  if (platform === "any") return null;
  return platform === "desktop"
    ? <Computer fontSize="small" sx={{ opacity: 0.6, flexShrink: 0 }} />
    : <PhoneAndroid fontSize="small" sx={{ opacity: 0.6, flexShrink: 0 }} />;
};

/**
 * Card component for a single game entry in the fun page gallery.
 * Displays the game name, description, and platform restriction icon. Navigates to the game on click.
 */
const GameCard = ({ game }: GameCardProps) => {
  const { t, currentLang } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(relativeToAbsolutePath(`fun/${game.id}`, currentLang));
  };

  return (
    <Card
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
          <Stack gap={0.5}>
            <Stack direction="row" alignItems="center" gap={1}>
              <PlatformIcon platform={game.platform} />
              <Typography variant="h6" component="h2">
                {t(`pages.fun.games.${game.id}.name`)}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t(`pages.fun.games.${game.id}.description`)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default GameCard;
