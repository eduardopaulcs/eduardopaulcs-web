/**
 * Shared mutable state across all game modules.
 * Using an object so that reassignments (e.g. state.gs = new InGame()) are
 * visible to every importer — named primitive exports cannot be re-bound by consumers.
 */
export const state = {
  /** Current active GameState instance. */
  gs: null,

  /** Accumulated delta time used for tick-rate throttling. */
  deltaSum: 0,

  /** Translations loaded in preload(). */
  i18n: {},
};
