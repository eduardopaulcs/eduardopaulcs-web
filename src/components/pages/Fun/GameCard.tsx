import { Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useTranslation from "../../../hooks/useTranslation";
import relativeToAbsolutePath from "../../../utils/relativeToAbsolutePath";

interface GameCardProps {
  game: string;
}

/**
 * Card component for a single game entry in the fun page gallery.
 * Displays the game name and description. Navigates to the game on click.
 */
const GameCard = ({ game }: GameCardProps) => {
  const { t, currentLang } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(relativeToAbsolutePath(`fun/${game}`, currentLang));
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
            <Typography variant="h6" component="h2">
              {t(`pages.fun.games.${game}.name`)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(`pages.fun.games.${game}.description`)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default GameCard;
