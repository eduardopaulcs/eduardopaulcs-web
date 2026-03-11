# Code Patterns — Quick Reference

Concrete skeletons to copy when creating new files. Always follow these exactly.

---

## Standard Component

```tsx
import { Box } from "@mui/material";

interface ExampleProps {
  title: string;
  onClick?: () => void;
}

/**
 * Short description of what this component does.
 */
const Example = ({ title, onClick }: ExampleProps) => {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: "primary.dark",
        padding: theme.spacing(2),
        "&:hover": { backgroundColor: "primary.main" },
        [theme.breakpoints.down("sm")]: { padding: theme.spacing(1) },
      })}
      onClick={onClick}
    >
      {title}
    </Box>
  );
};

export default Example;
```

Key rules:
- `interface` for props, never `type`
- `sx` receives `(theme) => ({...})` when theme tokens are needed
- Default export always at the bottom
- JSDoc above the `const`, not above the `interface`

---

## Section Component (`src/components/pages/Home/`)

```tsx
import { Box, Stack, Typography } from "@mui/material";
import useTranslation from "../../../hooks/useTranslation";
import useTranslationArray from "../../../hooks/useTranslationArray";

type SectionItemTranslation = {
  title: string;
  description: string;
};

/**
 * Displays the XYZ section of the portfolio page.
 */
const XyzSection = () => {
  const { t } = useTranslation();
  const items = useTranslationArray<SectionItemTranslation>("pages.home.sections.xyz.items");

  return (
    <Box sx={{ marginTop: "auto", marginBottom: "auto" }}>
      <Stack spacing={4}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: "bold" }}>
          {t("pages.home.sections.xyz.title")}
        </Typography>
        {/* section content */}
      </Stack>
    </Box>
  );
};

export default XyzSection;
```

Sections use `marginTop/Bottom: "auto"` to vertically center within the scroll container.

---

## Custom Hook Wrapper (wrapping a third-party hook)

```tsx
import { useExternalHook } from "some-library";

/**
 * Wrapper around some-library's useExternalHook.
 * Decouples the codebase from library internals.
 */
const useWrappedHook = () => {
  const { value, setter } = useExternalHook();
  return { value, setValue: setter };
};

export default useWrappedHook;
```

Always wrap third-party hooks. Never import library hooks directly in components.

---

## Switch Mapper — Icon + Component

Both mappers live in the same file (`src/utils/xyzSectionMappers.tsx`):

```tsx
import { QuestionMark, SomeIcon, OtherIcon } from "@mui/icons-material";
import SomeSection from "../components/pages/Home/SomeSection";
import OtherSection from "../components/pages/Home/OtherSection";

/**
 * Maps a section key to its corresponding icon.
 */
export const mapXyzSectionKeyToIcon = (key: string): JSX.Element => {
  switch (key) {
    case "some": return <SomeIcon />;
    case "other": return <OtherIcon />;
    default: return <QuestionMark />;
  }
};

/**
 * Maps a section key to its corresponding page component.
 */
export const mapXyzSectionKeyToComponent = (key: string): JSX.Element => {
  switch (key) {
    case "some": return <SomeSection />;
    case "other": return <OtherSection />;
    default: return <></>;
  }
};
```

Rules:
- Always include a `default` case
- Use `QuestionMark` icon as fallback
- File extension `.tsx` (not `.ts`) because it returns JSX
- Both mappers in one file per context (home sections, site sections, contact means)

---

## MUI Component Wrapper

When wrapping a MUI component, extend its props interface via `React.ComponentPropsWithoutRef`:

```tsx
import { Modal as MuiModal } from "@mui/material";

interface ModalProps extends React.ComponentPropsWithoutRef<typeof MuiModal> {
  onClose: () => void;         // override to make required
  showCross?: boolean;
  closeOnBackdropClick?: boolean;
}

/**
 * Wrapper around MUI Modal.
 * Decouples the codebase from MUI Modal internals and adds
 * optional backdrop-click and close-button behavior.
 */
const Modal = ({ onClose, children, showCross = true, closeOnBackdropClick = true, ...otherProps }: ModalProps) => {
  return (
    <MuiModal {...otherProps}>
      {/* custom content */}
    </MuiModal>
  );
};

export default Modal;
```

Apply the same pattern to any MUI component that needs project-specific behavior or a simpler API.

---

## useTranslationArray — Typed Array from Translations

```tsx
// Simple string array
const paragraphs = useTranslationArray<string>("pages.home.sections.aboutMe.description");

// Object array
type TimelineItem = { title: string; description: string[]; date: string; };
const items = useTranslationArray<TimelineItem>("pages.home.sections.aboutMe.timeline.items");

// Rendering
{paragraphs.map((text, idx) => (
  <Typography key={idx}>{text}</Typography>
))}
```

---

## Translation Key Structure

```
pages.
  landing.sections.{siteKey}.title
  landing.sections.{siteKey}.description
  home.sections.
    cover.name / profession / face
    aboutMe.title / description[]
    experience.title / ...
    tools.title / categories[{title, items[]}]
    contact.title / links.{contactKey}
  blog.title / comingSoon
  fun.title / comingSoon
navbar.links.{sectionKey}
navbar.toggleNavigation / closeNavigation / changeLanguage / goBack
footer.copyright
seo.lang / title / description
```

---

## Checklist: Add a Section to `/me`

1. **`src/constants.ts`** — add `newKey: "new-id"` to `HOME_SECTIONS`
2. **`src/utils/homeSectionMappers.tsx`** — add case to both `mapSectionKeyToIcon` and `mapSectionKeyToComponent`
3. **`src/components/pages/Home/NewKeySection.tsx`** — create the component
4. **`src/translations/en/common.json`** — add `navbar.links.newKey` + content keys under `pages.home.sections.newKey`
5. **`src/translations/es/common.json`** — same keys in Spanish

The section renders automatically in `Home.tsx` via `Object.entries(HOME_SECTIONS)` — no changes needed there.

---

## Checklist: Add a Top-Level Page

1. **`src/constants.ts`** — add `newPage: "new-page"` to `SITE_SECTIONS`
2. **`src/utils/siteSectionMappers.tsx`** — add case to `mapSiteSectionKeyToIcon`
3. **`src/pages/NewPage.tsx`** — create the page component
4. **`src/routes/router.tsx`** — add `<Route path="new-page" element={<NewPage />} />`
5. **`src/translations/en/common.json`** — add `pages.landing.sections.newPage.title/description` + `navbar.links.newPage`
6. **`src/translations/es/common.json`** — same in Spanish

The card on the Landing page renders automatically via `Object.keys(SITE_SECTIONS)`.
The Navbar link renders automatically when NOT on the `/me` page.
