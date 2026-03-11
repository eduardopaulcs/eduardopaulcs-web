# Project Context

Personal portfolio at `eduardopaulcs.com`. React 18 + TypeScript + Create React App + MUI v5. No backend — all content from translation files and environment variables. Bilingual (EN/ES) via URL prefix `/:lang/`. Deployed to GitHub Pages via GitHub Actions on push to `main`.

For detailed patterns and code skeletons: `.claude/patterns.md`
For system architecture and non-obvious design decisions: `.claude/architecture.md`

---

## File Structure

```
src/
├── components/
│   ├── layout/         # Global UI: Layout, Navbar, Content, Footer, NavbarList, NavbarListItem
│   └── pages/
│       └── Home/       # Section components: AboutMeSection, ExperienceSection, ToolsSection, ContactSection
├── hooks/              # Custom hooks (camelCase filenames)
├── images/             # Static assets
├── pages/              # Routable pages: Landing, Home, Blog, Fun, Error
├── routes/             # router.tsx — createBrowserRouter setup
├── styles/             # theme.ts + customTheme.json
├── translations/
│   ├── en/common.json
│   └── es/common.json
├── utils/              # Pure mappers and helpers (camelCase filenames)
└── constants.ts        # HOME_SECTIONS, SITE_SECTIONS, CONTACT_MEANS, LANGUAGES, DEFAULT_LANG
```

**Key distinction:** `src/pages/` = routable top-level pages. `src/components/pages/` = section components used within pages.

---

## Component Conventions

- **Functional components only** — no class components.
- **Default exports** for all components.
- Every component and every exported function must have a **JSDoc block comment** above it.
- Use inline comments to explain non-obvious logic. Prefix workarounds with `HACK!!`.
- Component filenames: **PascalCase**. Hook and utility filenames: **camelCase**.

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
interface CardProps { title: string; onClick: () => void; }      // Props → interface
type WorkExperience = { title: string; description: string[]; }; // Model → type
const useTranslationArray = <T,>(key: string) => { ... };        // Generic hook → trailing comma
```

---

## Styling

- **MUI theme-first**: always use theme tokens — never hardcode colors, fonts, or sizes.
- Prefer the **`sx` prop** for per-component styles. Use `styled()` only for reusable primitives.
- Custom theme values live under `theme.custom.*` (defined in `src/styles/customTheme.json`).
- Responsive design is **mobile-first**, using `theme.breakpoints` and `useMediaQuery`.
- The only custom theme token currently is `theme.custom.components.navbar.width` (`"56px"`).

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

- **Never hardcode user-facing text.** All strings go through the translation system.
- Use the custom `useTranslation()` hook — never import directly from `react-i18next`.
- Use `useTranslationArray<T>(key)` for arrays from translation files.
- When adding a translation key, always add it to **both** `en/common.json` and `es/common.json`.
- Translation keys follow nested dot-notation: `"pages.home.sections.cover.name"`.
- `useTranslation()` returns `{ t, currentLang, setLang }`.

---

## State Management

- Local state with `useState` only — no Redux, Zustand, or similar libraries.
- Extract reusable stateful logic into **custom hooks**.
- **Wrap third-party hooks and components** to decouple the codebase from library internals.
  - `useTranslation` wraps `react-i18next`'s hook
  - `useLangParam` wraps react-router's `useParams`
  - Apply the same pattern to any new third-party hook

---

## Routing

- The language is always encoded in the URL: `/:lang/`. No routes exist outside a language prefix.
- Use `relativeToAbsolutePath(route, lang)` from `src/utils/` — never build path strings inline.
- Use `useNavigate` with `{ replace: true }` for language switching and same-page navigation.
- All routes are defined in `src/routes/router.tsx` under the `<Layout>` parent route.

---

## Constants

All semantic identifiers live in `src/constants.ts`. Never use magic strings in components.

```ts
HOME_SECTIONS   // sections on the /me page: { aboutMe, experience, tools, contact }
SITE_SECTIONS   // top-level site pages: { me, blog, fun }
CONTACT_MEANS   // contact links: { linkedin, github, email }
LANGUAGES       // supported languages: ["en", "es"]
DEFAULT_LANG    // "en"
```

---

## Mapper Pattern

Section-to-component and key-to-icon mappings use **switch-based functions** in `src/utils/`. Never use inline conditionals or object literals for this — mappers need to return JSX and switch gives exhaustiveness safety.

```tsx
// src/utils/homeSectionMappers.tsx
export const mapSectionKeyToIcon = (key: string): JSX.Element => {
  switch (key) {
    case "aboutMe": return <Info />;
    case "experience": return <WorkHistory />;
    default: return <QuestionMark />;
  }
};
```

**To add a new section to `/me`:**
1. Add entry to `HOME_SECTIONS` in `src/constants.ts`
2. Add cases to both mappers in `src/utils/homeSectionMappers.tsx`
3. Create `src/components/pages/Home/NewSection.tsx`
4. Add translation keys to both `en/common.json` and `es/common.json`
5. Add `navbar.links.newKey` to both translation files

**To add a new top-level page:**
1. Add entry to `SITE_SECTIONS` in `src/constants.ts`
2. Add case to `src/utils/siteSectionMappers.tsx`
3. Create `src/pages/NewPage.tsx`
4. Add route in `src/routes/router.tsx`
5. Add `pages.landing.sections.newKey.title/description` to both translation files

---

## Layout System

The landing page (`/:lang/`) has no Navbar and no left margin. All other pages have both. This is controlled by `Layout.tsx`:

```tsx
const isLandingPage = pathname.split("/").filter(Boolean).length <= 1;
// ...
{!isLandingPage && <Navbar />}
<Content hasNavbar={!isLandingPage} />
```

`Content.tsx` applies `marginLeft: navbar.width` only when `hasNavbar` is true. **Do not** add margin-left logic in individual pages — it belongs in `Content.tsx` via the `hasNavbar` prop.

---

## Scroll System (on `/me` page)

Two hooks work together to keep URL hash ↔ visible section in sync. Both are initialized in `Navbar.tsx`:

```tsx
const syncHashRef = useRef<string | null>(null);
const isNavigatingRef = useScrollToLocation(syncHashRef); // hash → scroll
useScrollHashSync(isNavigatingRef, syncHashRef);           // scroll → hash
```

- `isNavigatingRef`: `true` while a programmatic scroll is running. Suppresses the IntersectionObserver.
- `syncHashRef`: stores the **exact hash string** the observer just navigated to. `useScrollToLocation` matches against this to skip auto-scroll for observer-driven hash changes. Storing the string (not a boolean) prevents a race condition where a user click and an observer fire overlap.

See `.claude/architecture.md` for full details on this system.

---

## Environment Variables

All runtime config comes from `REACT_APP_*` env vars (CRA convention). Access via `getEnvVariable(name)` in `src/utils/getEnvVariable.ts` — it auto-prefixes `REACT_APP_` and handles missing values gracefully.

Current variables:
- `REACT_APP_LINKEDIN_URL`
- `REACT_APP_GITHUB_URL`
- `REACT_APP_CONTACT_EMAIL`

Set in GitHub Actions secrets. Not available at runtime — build-time injection only.

---

## What NOT To Do

- ❌ Hardcode colors, font sizes, or spacing — use theme tokens
- ❌ Import `useTranslation` directly from `react-i18next`
- ❌ Construct URL paths inline with string concatenation
- ❌ Add state management libraries (Redux, Zustand, Jotai, etc.)
- ❌ Add new npm dependencies for things achievable with React + MUI
- ❌ Use `document.body.style.overflow = "hidden"` in pages — it blocks mobile scroll
- ❌ Put section/icon mapping logic inline in components — it belongs in `src/utils/` mappers
- ❌ Create routes without the `/:lang/` prefix
- ❌ Omit JSDoc from components or exported functions
- ❌ Use class components
- ❌ Skip adding a translation key to one of the two language files
