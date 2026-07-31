// Actual volume by fiscal period x offering, for the table below DMS
// Scorecard. The FY26 quarterly figures are the real supplied numbers;
// Monthly/Weekly rows split each quarter's total across its 3 months (or
// 13 weeks) deterministically (hash-weighted, remainder forced onto the
// last sub-period) so every granularity's totals still foot to the exact
// same quarterly and grand-total figures.
export const VOL_OFFERINGS = ['Pro', 'Premium', 'OOP', 'Basic'];

const QUARTER_DATA = [
  { pro: 1442946, Premium: 395596, OOP: 598484, Basic: 1612050 },
  { pro: 1392105, Premium: 348841, OOP: 526364, Basic: 1529372 },
  { pro: 1407634, Premium: 356185, OOP: 499991, Basic: 1559717 },
  { pro: 1033397, Premium: 275489, OOP: 365693, Basic: 1130008 },
].map((r) => ({ Pro: r.pro, Premium: r.Premium, OOP: r.OOP, Basic: r.Basic }));

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Deterministic split of `total` into `n` parts that sum back to `total`
// exactly (rounding remainder is absorbed by the last part).
function splitEvenly(total, n, seedKey) {
  const weights = Array.from({ length: n }, (_, i) => 60 + (hashCode(`${seedKey}|${i}`) % 41)); // 60..100
  const wsum = weights.reduce((s, w) => s + w, 0);
  const vals = weights.map((w) => Math.round((total * w) / wsum));
  const diff = total - vals.reduce((s, v) => s + v, 0);
  vals[vals.length - 1] += diff;
  return vals;
}

function buildRows(subPeriodsPerQuarter) {
  const rows = [];
  QUARTER_DATA.forEach((q, qi) => {
    const splitsByOffering = {};
    VOL_OFFERINGS.forEach((o) => { splitsByOffering[o] = splitEvenly(q[o], subPeriodsPerQuarter, `${qi}|${o}`); });
    for (let s = 0; s < subPeriodsPerQuarter; s++) {
      const row = {};
      VOL_OFFERINGS.forEach((o) => { row[o] = splitsByOffering[o][s]; });
      rows.push(row);
    }
  });
  return rows;
}

export const VOL_ROWS_BY_PERIOD = {
  qtr: QUARTER_DATA,
  monthly: buildRows(3),
  weekly: buildRows(13),
};

export const VOL_GRAND_TOTAL = VOL_OFFERINGS.reduce((acc, o) => {
  acc[o] = QUARTER_DATA.reduce((s, q) => s + q[o], 0);
  return acc;
}, {});

export function volRowTotal(row) {
  return VOL_OFFERINGS.reduce((s, o) => s + row[o], 0);
}
