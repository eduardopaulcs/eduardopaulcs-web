// @ts-check

/**
 * Post-build script: generates per-route HTML files with route-specific OG meta tags.
 *
 * GitHub Pages serves build/index.html only for the root path (/). All other paths
 * return a 404, which means social scrapers never see the OG tags in index.html
 * for deep links. This script solves that by creating individual index.html files
 * under build/ for each known route, with correct og:title, og:description, og:url,
 * and og:locale pre-injected.
 *
 * Covered routes: static pages, blog posts, fun games.
 *
 * Run automatically as part of `npm run build`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');

// Canonical site URL — single source of truth is package.json "homepage"
const { homepage: SITE_URL } = require(path.join(ROOT, 'package.json'));

// Language list and BCP 47 locale codes — single source of truth is src/config/languages.json
const { languages: LANGS, localeMap: LOCALE_MAP } = require(path.join(ROOT, 'src', 'config', 'languages.json'));

// --- Helpers ---

/**
 * Reads a nested value from an object using dot-notation (e.g. "pages.blog.title").
 * @param {Record<string, unknown>} obj
 * @param {string} key
 * @returns {string}
 */
function get(obj, key) {
  const value = key.split('.').reduce((o, k) => /** @type {any} */ (o)?.[k], obj);
  return value != null ? String(value) : '';
}

/**
 * Escapes a string for safe use as an HTML attribute value.
 * Also escapes $ to prevent interference with String.replace capture groups.
 * @param {string} str
 * @returns {string}
 */
function escapeHtmlAttr(str) {
  return str
    .replace(/\$/g, '$$$$')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Replaces the content of a <meta property="X" content="..." /> tag.
 * @param {string} html
 * @param {string} property
 * @param {string} value
 * @returns {string}
 */
function setMetaProperty(html, property, value) {
  const safe = escapeHtmlAttr(value);
  const escapedProp = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(
    new RegExp(`(<meta\\s+property="${escapedProp}"\\s+content=")[^"]*("\\s*/?>)`),
    `$1${safe}$2`
  );
}

/**
 * Replaces the content of a <meta name="X" content="..." /> tag.
 * @param {string} html
 * @param {string} name
 * @param {string} value
 * @returns {string}
 */
function setMetaName(html, name, value) {
  const safe = escapeHtmlAttr(value);
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(
    new RegExp(`(<meta\\s+name="${escapedName}"\\s+content=")[^"]*("\\s*/?>)`),
    `$1${safe}$2`
  );
}

/**
 * Generates an HTML string from baseHtml with the given OG overrides applied.
 * @param {string} baseHtml
 * @param {{ title: string, description: string, url: string, lang: string, contentLang?: string, type?: string }} opts
 * @returns {string}
 */
function buildHtml(baseHtml, { title, description, url, lang, contentLang, type = 'website' }) {
  const altLang = LANGS.find((/** @type {string} */ l) => l !== lang) ?? lang;
  const locale = LOCALE_MAP[contentLang ?? lang] ?? contentLang ?? lang;
  let html = baseHtml;
  html = setMetaProperty(html, 'og:type', type);
  html = setMetaProperty(html, 'og:url', url);
  html = setMetaProperty(html, 'og:title', title);
  html = setMetaProperty(html, 'og:description', description);
  html = setMetaProperty(html, 'og:locale', locale);
  html = setMetaProperty(html, 'og:locale:alternate', LOCALE_MAP[altLang] ?? altLang);
  html = setMetaName(html, 'twitter:title', title);
  html = setMetaName(html, 'twitter:description', description);
  return html;
}

/**
 * Writes content to filePath, creating intermediate directories as needed.
 * @param {string} filePath
 * @param {string} content
 */
function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

// --- Data ---

const baseHtml = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf-8');

/** @type {Array<{ id: string, title: string, preview: string, date: string, lang?: string }>} */
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'blog', 'index.json'), 'utf-8'));

/** @type {Array<{ id: string }>} */
const games = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'fun', 'index.json'), 'utf-8'));

/** Translation objects keyed by language code. */
const translations = Object.fromEntries(
  LANGS.map((/** @type {string} */ lang) => [
    lang,
    JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'translations', lang, 'common.json'), 'utf-8')),
  ])
);

// --- Generation ---

let count = 0;
console.log(`Generating OG pages for ${LANGS.length} language(s)...\n`);

for (const lang of LANGS) {
  const t = translations[lang];
  const siteTitle = get(t, 'seo.title');
  const siteDesc = get(t, 'seo.description');

  /** @param {string} pageTitle */
  const withSuffix = (pageTitle) => `${pageTitle} — ${siteTitle}`;

  // Static pages
  /** @type {Array<{ subpath: string, title: string, description: string, type?: string }>} */
  const staticPages = [
    { subpath: '',     title: siteTitle,                                   description: siteDesc },
    { subpath: 'me',   title: siteTitle,                                   description: siteDesc },
    { subpath: 'blog', title: withSuffix(get(t, 'pages.blog.title')),      description: siteDesc },
    { subpath: 'fun',  title: withSuffix(get(t, 'pages.fun.title')),       description: siteDesc },
  ];

  for (const page of staticPages) {
    const url = `${SITE_URL}/${lang}${page.subpath !== '' ? `/${page.subpath}` : ''}`;
    const html = buildHtml(baseHtml, { title: page.title, description: page.description, url, lang });
    writeFile(path.join(BUILD_DIR, lang, page.subpath, 'index.html'), html);
    console.log(`  [${lang}] ${url}`);
    console.log(`         "${page.title}"`);
    count++;
  }

  // Blog posts — og:locale reflects the post's content language, not the URL prefix
  for (const post of posts) {
    const url = `${SITE_URL}/${lang}/blog/${post.id}`;
    const title = withSuffix(post.title);
    const html = buildHtml(baseHtml, { title, description: post.preview, url, lang, contentLang: post.lang, type: 'article' });
    writeFile(path.join(BUILD_DIR, lang, 'blog', post.id, 'index.html'), html);
    console.log(`  [${lang}] ${url}`);
    console.log(`         "${title}"`);
    count++;
  }

  // Fun games
  for (const game of games) {
    const url = `${SITE_URL}/${lang}/fun/${game.id}`;
    const title = withSuffix(get(t, `pages.fun.games.${game.id}.name`));
    const description = get(t, `pages.fun.games.${game.id}.description`);
    const html = buildHtml(baseHtml, { title, description, url, lang });
    writeFile(path.join(BUILD_DIR, lang, 'fun', game.id, 'index.html'), html);
    console.log(`  [${lang}] ${url}`);
    console.log(`         "${title}"`);
    count++;
  }

  console.log('');
}

console.log(`Done. Generated ${count} pages.`);
