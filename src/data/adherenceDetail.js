// Pivot matrix for the Forecast Adherence detail view: Region -> Sub Region
// columns (each region group ending in its own Total column, plus a grand
// Total column) crossed with Offering -> Segment rows (Basic splits into
// Cons/Comm/Overall, Premium and Prosupport are Overall-only), plus a bottom
// Overall summary row. Values are deterministic (hash-derived, no
// Math.random/Date.now) so they stay stable across renders.

const REGION_SUBS = {
  AMER: ['Brazil', 'MMCLA', 'NA'],
  APJ: ['ANZ', 'CCC', 'IND', 'JPN', 'KOR', 'SA'],
  EMEA: ['CER', 'NER', 'SER', 'UKI'],
};

export const MATRIX_REGIONS = Object.keys(REGION_SUBS);
export const MATRIX_SUBS_BY_REGION = REGION_SUBS;

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function avg(nums) {
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

function leafValue(key) {
  return (hashCode(key) % 121) - 77; // -77..43
}

function buildLeafRow(rowKey) {
  const byRegion = {};
  const allSubValues = [];
  MATRIX_REGIONS.forEach((region) => {
    const subs = REGION_SUBS[region];
    const vals = subs.map((sub) => leafValue(`${rowKey}|${region}|${sub}`));
    const bySub = {};
    subs.forEach((sub, i) => { bySub[sub] = vals[i]; });
    byRegion[region] = { ...bySub, Total: avg(vals) };
    allSubValues.push(...vals);
  });
  return { byRegion, grandTotal: avg(allSubValues) };
}

function buildDerivedRow(componentRows) {
  const byRegion = {};
  const allSubValues = [];
  MATRIX_REGIONS.forEach((region) => {
    const subs = REGION_SUBS[region];
    const vals = subs.map((sub) => avg(componentRows.map((r) => r.byRegion[region][sub])));
    const bySub = {};
    subs.forEach((sub, i) => { bySub[sub] = vals[i]; });
    byRegion[region] = { ...bySub, Total: avg(vals) };
    allSubValues.push(...vals);
  });
  return { byRegion, grandTotal: avg(allSubValues) };
}

const basicCons = buildLeafRow('basic-cons');
const basicComm = buildLeafRow('basic-comm');
const basicOverall = buildDerivedRow([basicCons, basicComm]);
const premiumOverall = buildLeafRow('premium-overall');
const prosupportOverall = buildLeafRow('prosupport-overall');
const grandOverall = buildDerivedRow([basicOverall, premiumOverall, prosupportOverall]);

export const ADHERENCE_MATRIX = {
  regions: MATRIX_REGIONS,
  subsByRegion: REGION_SUBS,
  groups: [
    {
      label: 'Basic',
      rows: [
        { label: 'Cons', ...basicCons },
        { label: 'Comm', ...basicComm },
        { label: 'Overall', ...basicOverall },
      ],
    },
    { label: 'Premium', rows: [{ label: 'Overall', ...premiumOverall }] },
    { label: 'Prosupport', rows: [{ label: 'Overall', ...prosupportOverall }] },
  ],
  overall: grandOverall,
};
