import { Email, GitHub, LinkedIn, QuestionMark } from "@mui/icons-material";

export const mapContactMeanToIcon = (key: string) => {
  let icon = null;

  switch (key) {
    case "linkedin":
      icon = <LinkedIn />;
      break;

    case "github":
      icon = <GitHub />;
      break;

    case "email":
      icon = <Email />;
      break;

    default:
      icon = <QuestionMark />;
      break;
  }

  return icon;
};
