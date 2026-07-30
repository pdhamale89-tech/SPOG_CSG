// Pivot matrix for the Forecast Adherence detail view: Region -> Sub Region
// columns (each region group ending in its own Total column, plus a grand
// Total column) crossed with Offering -> Segment rows. Every offering
// (Basic/Premium/Prosupport) has a Cons/Comm/Overall breakdown so the modal
// can expand/collapse each offering to reveal or hide the segment split,
// plus a bottom grand Overall summary row. Values are deterministic
// (hash-derived, no Math.random/Date.now) so they stay stable across renders.

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

function buildOffering(key) {
  const cons = buildLeafRow(`${key}-cons`);
  const comm = buildLeafRow(`${key}-comm`);
  const overall = buildDerivedRow([cons, comm]);
  return { cons, comm, overall };
}

const basic = buildOffering('basic');
const premium = buildOffering('premium');
const prosupport = buildOffering('prosupport');
const grandOverall = buildDerivedRow([basic.overall, premium.overall, prosupport.overall]);

function offeringRows(offering) {
  return [
    { label: 'Cons', ...offering.cons },
    { label: 'Comm', ...offering.comm },
    { label: 'Overall', ...offering.overall },
  ];
}

export const ADHERENCE_MATRIX = {
  regions: MATRIX_REGIONS,
  subsByRegion: REGION_SUBS,
  groups: [
    { key: 'basic', label: 'Basic', rows: offeringRows(basic) },
    { key: 'premium', label: 'Premium', rows: offeringRows(premium) },
    { key: 'prosupport', label: 'Prosupport', rows: offeringRows(prosupport) },
  ],
  overall: grandOverall,
};
