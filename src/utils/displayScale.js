// Display-only value reduction for the CSG section (KPI cards, tables,
// charts). Two separate rules, applied to the rendered text only -- this
// never touches the underlying numbers/arrays that feed calculations:
//   - Whole numbers (counts/volumes): reduced by AT LEAST 10%, via
//     Math.floor(n * 0.9) so rounding never shaves the cut below 10%.
//   - Percentages: reduced by a flat 5 PERCENTAGE POINTS (80% -> 75%), not
//     a relative 5%. Applied to the number as literally written, so a
//     negative/variance percentage (e.g. "-3.8%") becomes more negative
//     ("-8.8%") rather than being treated as a magnitude to shrink.
// Any other decimal (no % sign, e.g. "1.93M", "11.0m") is left unchanged.
const WHOLE_NUMBER_FACTOR = 0.9;
const PERCENT_POINT_REDUCTION = 5;

const WHOLE_NUMBER_RE = /^([+-]?)([\d,]+)([KMB]?)$/;
const PERCENT_RE = /^([+\-±]?)(\d+(?:\.\d+)?)%$/;

function reducePercent(trimmed, points) {
  const m = trimmed.match(PERCENT_RE);
  if (!m) return null;
  const [, prefix, numStr] = m;
  const hasDecimal = numStr.includes('.');
  const magnitude = parseFloat(numStr);
  const round = (v) => (hasDecimal ? Number(v.toFixed(1)) : Math.round(v));

  if (prefix === '±') {
    return `±${round(Math.max(0, magnitude - points))}%`;
  }
  const signed = prefix === '-' ? -magnitude : magnitude;
  const reduced = signed - points;
  const sign = reduced < 0 ? '-' : (prefix === '+' ? '+' : '');
  return `${sign}${round(Math.abs(reduced))}%`;
}

export function scaleDisplayValue(value, factor = WHOLE_NUMBER_FACTOR) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;

  if (trimmed.includes('%')) {
    const reduced = reducePercent(trimmed, PERCENT_POINT_REDUCTION);
    return reduced == null ? value : reduced;
  }
  if (trimmed.includes('.')) return value;

  const match = trimmed.match(WHOLE_NUMBER_RE);
  if (!match) return value;
  const [, sign, digits, suffix] = match;
  const n = parseInt(digits.replace(/,/g, ''), 10);
  if (!Number.isFinite(n) || n === 0) return value;
  const scaled = Math.floor(n * factor);
  return `${sign}${scaled.toLocaleString()}${suffix}`;
}
