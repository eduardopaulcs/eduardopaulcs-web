/**
 * Cardinal grid directions as frozen {x, y} offsets. With these, moving one
 * step is just `pos.x += dir.x; pos.y += dir.y` and "opposite" is a vector
 * negation — much cleaner than the old `cos(dir * PI)` scheme that needed
 * half-pi sentinel values like 0.5 and 1.5.
 */
export const UP    = Object.freeze({ x:  0, y: -1 });
export const DOWN  = Object.freeze({ x:  0, y:  1 });
export const LEFT  = Object.freeze({ x: -1, y:  0 });
export const RIGHT = Object.freeze({ x:  1, y:  0 });
export const NONE  = Object.freeze({ x:  0, y:  0 });

/**
 * True if `a` and `b` point in opposite directions. NONE is never opposite
 * to anything, so the very first move (lastDir = NONE) is always allowed.
 */
export function isOpposite(a, b) {
  if ((a.x === 0 && a.y === 0) || (b.x === 0 && b.y === 0)) return false;
  return a.x === -b.x && a.y === -b.y;
}
