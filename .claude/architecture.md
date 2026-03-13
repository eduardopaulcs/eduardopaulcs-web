# Architecture — System Design Reference

Non-obvious systems and design decisions. Read this before touching routing, scroll, layout, or i18n internals.

---

## Routing System

```
createBrowserRouter
└── Route path="/" element={<Layout />}                        ← handles redirects + SEO
    └── Route path=":lang"
        ├── Route index element={<Landing />}                  → /:lang/
        ├── Route path="me" element={<Home />}                 → /:lang/me
        ├── Route path="blog" element={<Blog />}               → /:lang/blog
        ├── Route path="blog/:postId" element={<BlogPost />}   → /:lang/blog/:postId
        ├── Route path="fun" element={<Fun />}                 → /:lang/fun
        └── Route path="fun/:gameId" element={<FunGame />}     → /:lang/fun/:gameId
```

**Language detection order** (in `translator.ts`):
1. URL pathname first segment (e.g. `/en/me` → `"en"`)
2. Browser language (`navigator.language`)
3. `DEFAULT_LANG` (`"en"`)

**Invalid route handling** (in `Layout.tsx`): if `:lang` is not in `LANGUAGES`, or if pathname is `/`, redirect to `/${browserLang}` or `/${currentLang}`. Known limitation: `/test` is interpreted as lang=test, not a 404.

---

## Layout System

```
Layout.tsx
├── Language switcher (fixed top-right — hidden on game pages)
├── Navbar (excluded when isLandingPage or isGamePage)
├── Content (marginLeft = navbar.width when hasNavbar; Container skipped when disableContainer)
└── Footer (excluded on game pages)
```

`isLandingPage` detection:
```ts
const isLandingPage = pathname.split("/").filter(Boolean).length <= 1;
// "/en/" → ["en"] → length 1 → true
// "/en/me" → ["en", "me"] → length 2 → false
```

`isGamePage` detection:
```ts
const segments = pathname.split("/").filter(Boolean);
const isGamePage = segments.length === 3 && segments[1] === "fun";
// "/en/fun/dichos" → ["en", "fun", "dichos"] → length 3, [1]="fun" → true
// "/en/fun"        → ["en", "fun"] → length 2 → false
```

**Why `hasNavbar` prop on Content, not reading URL in Content?**
Layout owns the decision of whether the Navbar exists. Content should not re-derive that from the URL — it would duplicate logic and create a coupling point. Layout passes the fact down explicitly.

**Why `marginLeft` on `<main>` and not padding on the page?**
The MUI permanent Drawer does not push content — it overlaps. The `marginLeft` on `<main>` compensates for the drawer width so content is not occluded. On the landing page, there is no drawer, so `marginLeft` must be 0.

**Why `disableContainer` on game pages?**
`Content.tsx` normally wraps `<Outlet />` in MUI `<Container>`, which adds horizontal padding and a max-width constraint. Game pages render an `<iframe>` that must fill the entire viewport with no padding. Passing `disableContainer={isGamePage}` from `Layout.tsx` to `Content.tsx` skips the `<Container>` wrapper only for game pages, keeping all other pages unchanged.

---

## Scroll / Hash Sync System (on `/me`)

Two hooks maintain bidirectional sync between the URL hash and the visible section. Both are initialized in `Navbar.tsx` with shared refs:

```tsx
const syncHashRef = useRef<string | null>(null);
const isNavigatingRef = useScrollToLocation(syncHashRef); // hash → scroll
useScrollHashSync(isNavigatingRef, syncHashRef);           // scroll → hash
```

### Hook 1: `useScrollToLocation` (hash → scroll)

Triggered by `useLocation().hash` changes. When the hash changes:
1. If `syncHashRef.current === newHash` → the change came from the observer, skip scroll, clear ref.
2. Otherwise → scroll to the element via `element.scrollIntoView({ behavior: "smooth" })`.
3. Sets `isNavigatingRef.current = true` during scroll, resets on `scrollend` event.

### Hook 2: `useScrollHashSync` (scroll → hash)

Uses `IntersectionObserver` on all `HOME_SECTIONS` elements. On intersection change:
1. If `isNavigatingRef.current === true` → skip (programmatic scroll in progress).
2. Find the section with the highest `intersectionRatio`.
3. Set `syncHashRef.current = "#sectionId"` BEFORE calling `navigate` — this is the signal to `useScrollToLocation`.
4. Call `navigate({ hash: "#sectionId" }, { replace: true })`.

### Same-hash click (in `Navbar.tsx` → `handleLinkClick`)

When the user clicks a nav link whose hash already matches the current URL hash, `navigate()` does nothing (no hash change event). The fix: detect this case and call `scrollIntoView` directly, setting `isNavigatingRef` manually.

### Why `syncHashRef` stores a string, not a boolean?

If it stored `true`, a race condition is possible:
- Observer fires, sets `syncHashRef = true`, calls `navigate("#about-me")`
- User simultaneously clicks "#experience"
- `useScrollToLocation` sees `syncHashRef = true` and skips scroll for "#experience" — wrong!

By storing the exact hash string, `useScrollToLocation` only skips when the incoming hash matches exactly what the observer set. The user click produces a different hash, so it proceeds correctly.

### Why `scrollend` event instead of `setTimeout`?

`scrollend` fires when the browser finishes the smooth scroll, regardless of duration. A `setTimeout` would require a magic number tied to scroll animation duration — fragile and wrong if the user interrupts the scroll. `scrollend` is interruptible-aware by design.

---

## i18n Pipeline

```
src/translations/translator.ts    ← i18next config, language detection
src/hooks/useTranslation.tsx      ← custom wrapper: { t, currentLang, setLang }
src/hooks/useTranslationArray.tsx ← typed array wrapper: useTranslationArray<T>(key)
src/translations/en/common.json   ← English strings (single "common" namespace)
src/translations/es/common.json   ← Spanish strings (same structure)
```

**Key behaviors:**
- Single namespace: `"common"` — all keys live together.
- Arrays via `returnObjects: true` — i18next returns the raw JSON array.
- String interpolation: `{{variable}}` syntax (e.g., `"Error {{code}}!"`).
- `escapeValue: false` — HTML is allowed in translation strings.
- Language is changed via `setLang(lang)` from `useTranslation()`, not via i18next directly.

---

## Section Data Flow (on `/me`)

```
constants.ts (HOME_SECTIONS)
    ↓ Object.entries()
Home.tsx
    ↓ for each [key, id]
    Section component (id={id})
        ↓ mapSectionKeyToComponent(key)
        XyzSection.tsx
            ↓ useTranslation / useTranslationArray
            en/common.json or es/common.json
```

`Home.tsx` never imports section components directly — it uses the mapper. Adding a new section only requires adding to constants + mapper + creating the component.

---

## Fun / Games System

### Data pipeline

```
public/fun/index.json          ← plain string[] of game IDs (e.g. ["dichos"])
    ↓ fetch (useFunGames.ts)
useFunGames hook               ← module-level cache, shared across concurrent callers
    ↓
Fun.tsx                        ← searchable gallery, renders <GameCard game={id} />
FunGame.tsx                    ← individual game, renders <iframe>
```

`public/fun/index.json` is the source of truth for which games exist. It's a flat string array — no metadata objects. Adding a new game only requires adding its ID to this file and creating the game folder.

### Game folder structure

```
public/fun/games/
├── i18n.js                    ← shared ES-module i18n loader (all games use this)
└── {gameId}/
    ├── index.html             ← standalone game (ES module, top-level await)
    ├── style.css
    ├── assets/                ← game-specific assets (e.g. words.json)
    └── i18n/
        ├── en.json            ← game-specific strings
        └── es.json
```

### Game i18n (standalone, no React)

Games are self-contained HTML pages in iframes. They don't have access to the React i18n pipeline. Instead they use a shared vanilla JS loader:

```js
// public/fun/games/i18n.js  (ES module)
export async function loadTranslations(gameId, lang) {
  // fetches /fun/games/{gameId}/i18n/{lang}.json
  // falls back to "en" if the requested lang is missing
  // returns a t(key) function using dot-notation resolution
}
```

Usage in a game's `index.html`:
```html
<script type="module">
  import { loadTranslations } from '/fun/games/i18n.js';
  const lang = new URLSearchParams(location.search).get('lang') ?? 'en';
  const t = await loadTranslations('dichos', lang);
  document.getElementById('btn').textContent = t('generate');
</script>
```

The React app passes `?lang={currentLang}` in the iframe `src` URL so the game starts in the correct language without any cross-frame communication.

### FunGame page — floating UI ownership

On game pages, `Layout.tsx` hides its own lang switcher and footer. `FunGame.tsx` owns all floating controls:

- **Desktop (≥ sm):** back-nav buttons stacked top-left; lang switcher top-right. All `position: fixed`, `zIndex: 2000`.
- **Mobile (< sm):** single `IconButton` (`☰`/`✕`) fixed top-left. Tap opens a vertical panel with back-nav + lang switcher buttons. Any action closes the panel.

All floating buttons use `color="secondary"` (violet), `size="small"`, `borderRadius: 0`, and no hover color change (`"&:hover": { backgroundColor: "secondary.main" }`).

**Why FunGame owns the lang switcher instead of Layout?**
The lang switcher in Layout is positioned top-right and always visible. On game pages the iframe fills 100vh, so the switcher would float above the game content — acceptable on desktop but not on mobile where screen space is scarce. Giving FunGame full ownership allows the mobile collapse pattern without adding mobile-detection logic to Layout.

### CSS gotchas in standalone game pages

- Do NOT set `html, body { height: 100%; display: flex }` in a game's `style.css`. When the game is embedded in an iframe those styles have no effect on the parent page, but if they propagate (e.g. shared styles) they can lock the iframe viewport and block scroll. Use `min-height: 100vh` instead.

---

## Background Component

`src/components/pages/Home/Background.tsx` renders a fixed, full-screen decorative gradient/image layer.

**Known CSS gotchas:**
- `filter: blur(8px)` extends the painted area beyond the element's bounds, causing horizontal scroll. Fix: `clipPath: "inset(0)"` on the Background element — this clips the filter output at the element boundary without affecting children.
- Do NOT use `overflow: hidden` on the Background element itself to contain blur — it doesn't clip filter output.

**On the Landing page:** `overflow: "hidden"` on the root Landing Box clips the decorative face images (blob, lines) at the viewport boundary. This is intentional — they overflow only on very narrow screens. Do NOT replace this with `document.body.style.overflow = "hidden"` — that blocks all scroll including vertical, which breaks mobile layouts where the stacked content exceeds 100vh.

---

## MUI Gotchas

### Tooltip with `placement="right"` drifts on scroll

MUI's default `Popper` uses `position: absolute` relative to the document, causing it to drift as the page scrolls. Fix:

```tsx
<Tooltip
  title={label}
  placement="right"
  arrow
  PopperProps={{ popperOptions: { strategy: "fixed" } }}
>
  {children}
</Tooltip>
```

This switches the Popper to `position: fixed`, anchoring it to the viewport instead of the document.

---

## Blog System

### Data pipeline

```
public/blog/index.json           ← post metadata array (newest-first by convention)
    ↓ fetch (useBlogPosts.ts)
useBlogPosts hook                ← module-level cache, shared across concurrent callers
    ↓
Blog.tsx                         ← list page with title + year filters
BlogPost.tsx                     ← detail page, resolves :postId → renders BlogPostDetail
    ↓
BlogPostDetail.tsx               ← fetches the .md file, renders it with ReactMarkdown
    ↓ fetch (useBlogPost.ts)
public/blog/posts/{date}-{id}.md ← post content
```

### Post file naming

`public/blog/posts/{YYYY-MM-DD}-{id}.md` — both the date and the slug are required in the filename. The path is derived in `useBlogPost.ts` from `post.date` and `post.id`.

`public/blog/index.json` is the only source of truth for which posts exist. It must be kept sorted **newest-first** — that is the display order.

### Why no auto-discovery?

CRA/browser cannot list directory contents without a server. Auto-discovery would require either a backend endpoint, a prebuild script, or a bundler plugin. A manually maintained `index.json` is the simplest approach with zero runtime cost for a static GitHub Pages site.

### Request deduplication in `useBlogPosts`

`Blog.tsx` and `BlogPost.tsx` both call `useBlogPosts()` and can mount simultaneously (e.g. direct navigation to a post URL). Without deduplication this fires two `fetch` calls to `index.json`.

Module-level variables prevent this:

```ts
let cachedPosts: BlogPostMeta[] | null = null;
let pendingFetch: Promise<BlogPostMeta[]> | null = null;
```

- **First caller:** creates `pendingFetch`, attaches `.then` handlers.
- **Concurrent second caller:** `pendingFetch` already set — attaches to the same promise, no second fetch.
- **Subsequent mounts:** `cachedPosts !== null` → `useEffect` exits immediately, state initializes with cached data and `loading: false`.

**Why module-level, not context/provider?** No extra component tree wrapping needed — deduplication is transparent to callers.

### `lang` field on `BlogPostMeta`

```ts
lang?: string;  // BCP 47 tag, e.g. "en", "es"
```

Used exclusively as the HTML `lang` attribute on the wrapping element (`<Card lang={post.lang}>` in `BlogPostCard`, `<Box lang={post.lang}>` wrapping `ReactMarkdown` in `BlogPostDetail`). This enables browser-native translation prompts when a post's language differs from the page language.

**No visual badge or indicator** — the field is invisible to the user. Do not add any language label to post cards or detail views.

### Year filter visibility

`BlogDateFilter` returns `null` when there is only one year of posts (or none). This avoids showing a filter with a single option that has no effect.

### Title search (`normalize` utility)

`src/utils/normalize.ts` provides case- and accent-insensitive string normalization:

```ts
const normalize = (s: string): string =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
```

`Blog.tsx` tokenizes the query on whitespace and requires **all tokens** to appear in the normalized title (`matchesTitle`). Multi-word queries act as AND filters — `"codigo ia"` matches `"Código e IA"`.

### `getEnvVariable` raw mode (for `PUBLIC_URL`)

`process.env.PUBLIC_URL` is a special CRA variable — it does not carry the `REACT_APP_` prefix. Access it via `getEnvVariable` with `raw: true`:

```ts
getEnvVariable("PUBLIC_URL", "", true)  // returns process.env.PUBLIC_URL or ""
```

Both `useBlogPosts` and `useBlogPost` use this form. Do not access `process.env.PUBLIC_URL` directly in hooks or components — go through `getEnvVariable` to keep the access pattern consistent.

---

## Environment Variables

Build-time injection via Create React App's `REACT_APP_*` convention.

| Variable | Used in |
|---|---|
| `REACT_APP_LINKEDIN_URL` | `ContactSection` via `getEnvVariable("LINKEDIN_URL")` |
| `REACT_APP_GITHUB_URL` | `ContactSection` via `getEnvVariable("GITHUB_URL")` |
| `REACT_APP_CONTACT_EMAIL` | `ContactSection` via `getEnvVariable("CONTACT_EMAIL")` |

Set as GitHub Actions secrets. Not accessible at runtime — only during `npm run build`.

`getEnvVariable(name)` in `src/utils/getEnvVariable.ts` auto-prefixes `REACT_APP_` and returns a fallback string if missing.

---

## Deployment

```
Push to main
    → GitHub Actions (.github/workflows/deploy.yml)
    → npm ci + npm run build (with REACT_APP_* secrets injected)
    → Upload ./build artifact
    → Deploy to GitHub Pages
    → Live at eduardopaulcs.com (CNAME in public/CNAME)
```

`public/404.html` handles GitHub Pages' lack of server-side routing — it redirects unknown paths back to `index.html` so React Router can handle them.

Node version: 18.20.8 (pinned in `.nvmrc` and CI workflow).
