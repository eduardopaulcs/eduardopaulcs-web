import { TextField } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";

interface GameSearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Name search filter for the fun games list page.
 * Styled to match the blog title filter: always-visible outline, secondary colors.
 */
const GameSearchFilter = ({ value, onChange }: GameSearchFilterProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={t("pages.fun.searchByName")}
      sx={{
        width: "100%",
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
          "& fieldset": { borderColor: "secondary.main" },
          "&:hover fieldset": { borderColor: "secondary.light" },
          "&.Mui-focused fieldset": { borderColor: "secondary.light" },
        },
        "& .MuiInputLabel-root": { color: "secondary.main" },
        "& .MuiInputLabel-root.Mui-focused": { color: "secondary.light" },
      }}
    />
  );
};

export default GameSearchFilter;
