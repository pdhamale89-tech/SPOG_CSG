// Shared builder for Region -> Sub Region (with per-region + grand Total
// columns) x Group -> Segment (with an Overall row) pivot matrices, used by
// both the Forecast Adherence Detail and Shipment Adherence Detail tables.
// Values are deterministic (hash-derived, no Math.random/Date.now).

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

function buildLeafRow(regions, subsByRegion, rowKey) {
  const byRegion = {};
  const allSubValues = [];
  regions.forEach((region) => {
    const subs = subsByRegion[region];
    const vals = subs.map((sub) => leafValue(`${rowKey}|${region}|${sub}`));
    const bySub = {};
    subs.forEach((sub, i) => { bySub[sub] = vals[i]; });
    byRegion[region] = { ...bySub, Total: avg(vals) };
    allSubValues.push(...vals);
  });
  return { byRegion, grandTotal: avg(allSubValues) };
}

function buildDerivedRow(regions, subsByRegion, componentRows) {
  const byRegion = {};
  const allSubValues = [];
  regions.forEach((region) => {
    const subs = subsByRegion[region];
    const vals = subs.map((sub) => avg(componentRows.map((r) => r.byRegion[region][sub])));
    const bySub = {};
    subs.forEach((sub, i) => { bySub[sub] = vals[i]; });
    byRegion[region] = { ...bySub, Total: avg(vals) };
    allSubValues.push(...vals);
  });
  return { byRegion, grandTotal: avg(allSubValues) };
}

// groupDefs: [{ key, label, segments: [{ key, label }] }]
// Each group's row set is its segments (leaf, hash-derived) plus a derived
// Overall row; the matrix's top-level `overall` is derived from every
// group's Overall row.
export function buildPivotMatrix(regions, subsByRegion, groupDefs) {
  const groups = groupDefs.map((g) => {
    const segRows = g.segments.map((seg) => ({ seg, row: buildLeafRow(regions, subsByRegion, `${g.key}-${seg.key}`) }));
    const overallRow = buildDerivedRow(regions, subsByRegion, segRows.map((s) => s.row));
    return {
      key: g.key,
      label: g.label,
      overallRow,
      rows: [...segRows.map((s) => ({ label: s.seg.label, ...s.row })), { label: 'Overall', ...overallRow }],
    };
  });
  const overall = buildDerivedRow(regions, subsByRegion, groups.map((g) => g.overallRow));
  const publicGroups = groups.map((g) => ({ key: g.key, label: g.label, rows: g.rows }));
  return { regions, subsByRegion, groups: publicGroups, overall };
}
