// Display-only reduction for whole-number values shown in the CSG section
// (KPI cards, mini-stats, tables). Percentages and decimals are left
// untouched -- this only ever rewrites the rendered text, never the
// underlying numbers/arrays that charts, deltas and other calculations use.
//
// Uses Math.floor (not round) so the reduction is always AT LEAST the
// requested factor, never less (rounding up could shave off under 10% for
// small values).
const DISPLAY_SCALE_FACTOR = 0.9;

const WHOLE_NUMBER_RE = /^([+-]?)([\d,]+)([KMB]?)$/;

export function scaleDisplayValue(value, factor = DISPLAY_SCALE_FACTOR) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes('%') || trimmed.includes('.')) return value;
  const match = trimmed.match(WHOLE_NUMBER_RE);
  if (!match) return value;
  const [, sign, digits, suffix] = match;
  const n = parseInt(digits.replace(/,/g, ''), 10);
  if (!Number.isFinite(n) || n === 0) return value;
  const scaled = Math.floor(n * factor);
  return `${sign}${scaled.toLocaleString()}${suffix}`;
}
