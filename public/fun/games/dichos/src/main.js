import { loadTranslations } from '/fun/games/i18n.js';

const lang = new URLSearchParams(window.location.search).get('lang') || 'en';

const btn = document.getElementById('generateBtn');
const quoteArea = document.getElementById('quoteArea');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');

loadingEl.style.display = 'inline-block';

let words = null;

/**
 * Returns a random element from an array.
 * @param {any[]} arr
 */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a dicho from the loaded words and renders it.
 */
function generateDicho() {
  if (!words) return;
  const adj = random(words.adjectives);
  const noun = random(words.nouns);
  const dicho = Math.random() < 0.5
    ? 'más ' + adj + ' que ' + noun
    : adj + ' como ' + noun;
  renderDicho(dicho);
}

/**
 * Renders a dicho string into the quote area.
 * @param {string} dicho
 */
function renderDicho(dicho) {
  const box = document.createElement('div');
  box.className = 'quote-box';

  const open = document.createElement('span');
  open.className = 'open-quote';
  open.textContent = '\u201C';

  const text = document.createElement('p');
  text.className = 'dicho';
  text.textContent = dicho;

  const close = document.createElement('span');
  close.className = 'close-quote';
  close.textContent = '\u201D';

  box.appendChild(open);
  box.appendChild(text);
  box.appendChild(close);

  // Replace content — DOM replacement re-triggers CSS animation
  quoteArea.innerHTML = '';
  quoteArea.appendChild(box);
  quoteArea.style.display = 'block';
}

try {
  const [t, wordsData] = await Promise.all([
    loadTranslations('dichos', lang),
    fetch('/fun/games/dichos/assets/words.json').then(r => {
      if (!r.ok) throw new Error('Failed to load words (' + r.status + ')');
      return r.json();
    }),
  ]);

  btn.textContent = t('generate');
  words = wordsData;
  loadingEl.style.display = 'none';
  btn.disabled = false;
} catch (err) {
  loadingEl.style.display = 'none';
  errorEl.textContent = err.message;
  errorEl.style.display = 'block';
}

btn.addEventListener('click', generateDicho);
