/**
 * Resolves a dot-notation key from a translations object.
 * Returns undefined if the key is not found.
 * @param {Record<string, any>} obj
 * @param {string} key
 * @returns {string | undefined}
 */
function resolve(obj, key) {
  return key.split('.').reduce((acc, k) => acc?.[k], obj);
}

/**
 * Loads translations for a game and returns a t() lookup function.
 * Falls back to English if the requested language file is unavailable.
 * @param {string} gameId - The game's id (e.g. "dichos")
 * @param {string} lang   - The language code (e.g. "en", "es")
 * @returns {Promise<function(string): string>}
 */
export async function loadTranslations(gameId, lang) {
  const load = async (l) => {
    const r = await fetch(`/fun/games/${gameId}/i18n/${l}.json`);
    if (!r.ok) throw new Error(`i18n: missing ${gameId}/${l}.json`);
    return r.json();
  };

  let data;
  try {
    data = await load(lang);
  } catch {
    data = await load('en');
  }

  return (key) => resolve(data, key) ?? key;
}
