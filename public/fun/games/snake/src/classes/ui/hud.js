/**
 * DOM-based UI layer (HTML overlay on top of the canvas).
 * Used for the menu, the live score and the end screen.
 */

function root() {
  let el = document.getElementById('ui');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ui';
    document.body.appendChild(el);
  }
  return el;
}

/** Replaces the overlay content. `mode` adds a class for styling. */
export function setUI(html, mode = '') {
  const el = root();
  el.className = mode;
  el.innerHTML = html;
  el.style.display = html ? 'flex' : 'none';
}

export function clearUI() {
  setUI('');
}
