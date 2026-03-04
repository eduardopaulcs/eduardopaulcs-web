# Project Context

This is a personal portfolio web app built with React 18, TypeScript, and Create React App. It supports two languages (English and Spanish) via URL-based routing, and uses MUI as the primary UI library. There is no backend — all content comes from translation files and environment variables.

---

## Component Conventions

- **Functional components only** — no class components.
- **Default exports** for all components.
- Every component and exported function must have a **JSDoc block comment** above it.
- Use inline comments to explain non-obvious logic. Prefix workarounds with `HACK!!`.
- Component filenames are **PascalCase**. Hook and utility filenames are **camelCase**.

```tsx
/**
 * Displays the cover section of the home page.
 */
const CoverSection = () => {
  return <Box>...</Box>;
};

export default CoverSection;
```

---

## TypeScript Style

- Use **`interface`** for component props.
- Use **`type`** aliases for data/domain models.
- Extend MUI component props via `React.ComponentPropsWithoutRef<typeof MuiComponent>`.
- Generic hooks use the `<T,>` trailing-comma syntax to avoid JSX ambiguity.
- Strict mode is enabled — **no implicit `any`**.

```tsx
// Props → interface
interface CardProps {
  title: string;
  onClick: () => void;
}

// Data model → type
type WorkExperience = {
  title: string;
  description: string | string[];
  date?: string;
};

// Generic hook
const useTranslationArray = <T,>(key: string) => { ... };
```

---

## Styling

- **MUI theme-first**: always use theme tokens (`palette`, `typography`, `spacing`, `custom.*`) — never hardcode colors, fonts, or sizes.
- Prefer the **`sx` prop** for per-component styles.
- Use the **`styled()` API** only for reusable styled primitives.
- Custom theme values live under `theme.custom.*`.
- Responsive design is **mobile-first**, using `theme.breakpoints` and `useMediaQuery`.
- Pseudo-classes and nested selectors are written inline within `sx`:

```tsx
<Box
  sx={(theme) => ({
    width: theme.custom.components.navbar.width,
    backgroundColor: "primary.dark",
    "&:hover": { backgroundColor: "primary.main" },
    [theme.breakpoints.down("sm")]: { width: "100%" },
  })}
/>
```

---

## Internationalization (i18n)

- **Never hardcode user-facing text.** All strings must go through the translation system.
- Use the custom `useTranslation()` hook — not `useTranslation` directly from `react-i18next`.
- Use `useTranslationArray<T>(key)` for loading arrays from translation files.
- When adding a new translation key, always add it to **both** `en/common.json` and `es/common.json`.
- Translation keys follow a nested structure: `"pages.home.sections.cover.title"`.

---

## State Management

- Local state with `useState` only — no Redux, Zustand, or similar.
- Extract reusable stateful logic into **custom hooks**.
- **Wrap third-party hooks and components** to decouple the codebase from library internals. This applies to hooks (like i18next's `useTranslation`) and components (like MUI's `Modal`).

---

## Routing

- The language is always encoded in the URL: `/:lang/`. There are no routes outside of a language prefix.
- Use `useNavigate` with `{ replace: true }` for language switching to avoid polluting browser history.
- Path-building logic belongs in utility functions — don't construct path strings inline in components.

---

## General Principles

- **Composition over complexity**: prefer composing small components over building large, multi-purpose ones.
- **Constants over magic values**: strings and numbers that have semantic meaning belong in constants files.
- **Utilities are pure**: mapper and helper functions have no side effects and don't touch state.
- **Don't add dependencies** for things achievable with React and MUI.
- Section-to-component and key-to-icon mappings use switch-based mapper functions in utils — follow that pattern when adding new sections or contact means.
