import { TextField } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";

interface BlogTitleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Title search filter for the blog list page.
 * Styled so the outline is always visible (always-active appearance), with
 * a brighter border on hover and focus.
 */
const BlogTitleFilter = ({ value, onChange }: BlogTitleFilterProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={t("pages.blog.searchByTitle")}
      sx={{
        minWidth: 260,
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

export default BlogTitleFilter;
