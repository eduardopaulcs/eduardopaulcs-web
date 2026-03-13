# Architecture — System Design Reference

Non-obvious systems and design decisions. Read this before touching routing, scroll, layout, or i18n internals.

---

## Routing System

```
createBrowserRouter
└── Route path="/" element={<Layout />}        ← handles redirects + SEO
    └── Route path=":lang"
        ├── Route index element={<Landing />}   → /:lang/
        ├── Route path="me" element={<Home />}  → /:lang/me
        ├── Route path="blog" element={<Blog />}
        └── Route path="fun" element={<Fun />}
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
├── Language switcher (fixed top-right, always visible if LANGUAGES.length > 1)
├── Navbar (excluded when isLandingPage)
├── Content (marginLeft = navbar.width when hasNavbar, 0 otherwise)
└── Footer
```

`isLandingPage` detection:
```ts
const isLandingPage = pathname.split("/").filter(Boolean).length <= 1;
// "/en/" → ["en"] → length 1 → true
// "/en/me" → ["en", "me"] → length 2 → false
```

**Why `hasNavbar` prop on Content, not reading URL in Content?**
Layout owns the decision of whether the Navbar exists. Content should not re-derive that from the URL — it would duplicate logic and create a coupling point. Layout passes the fact down explicitly.

**Why `marginLeft` on `<main>` and not padding on the page?**
The MUI permanent Drawer does not push content — it overlaps. The `marginLeft` on `<main>` compensates for the drawer width so content is not occluded. On the landing page, there is no drawer, so `marginLeft` must be 0.

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
