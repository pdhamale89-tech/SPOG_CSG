// Deterministic (non-random) breakdown helpers for the Capacity Overview HC
// Avg / Excess HC KPI drill-down modals -- same hash-weighted-split approach
// as volumeByPeriod.js's splitEvenly, so a given total always splits into the
// same numbers on every render and still foots back to that exact total.
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function splitByWeights(total, weights, seedKey) {
  // Nominal weights are jittered deterministically by seedKey so repeated
  // categories don't look like a flat percentage split, while the parts
  // still sum back to `total` exactly (remainder absorbed by the last part).
  const jittered = weights.map((w, i) => w * (0.9 + (hashCode(`${seedKey}|${i}`) % 21) / 100));
  const wsum = jittered.reduce((s, w) => s + w, 0);
  const vals = jittered.map((w) => Math.round((total * w) / wsum));
  const diff = total - vals.reduce((s, v) => s + v, 0);
  vals[vals.length - 1] += diff;
  return vals;
}

// Weights mirror the channel mix used elsewhere in the app (forecastData.js's
// globalMonthly voice/chat/email/social first-period split).
const CHANNELS = [
  { label: 'Voice', weight: 55 },
  { label: 'Email', weight: 15 },
  { label: 'Chat', weight: 25 },
  { label: 'Social', weight: 5 },
];

export function channelBreakdown(total, seedKey) {
  const vals = splitByWeights(total || 0, CHANNELS.map((c) => c.weight), seedKey);
  return CHANNELS.map((c, i) => ({ label: c.label, value: vals[i] }));
}

// Region -> Agent Location, matching the app's AMER/EMEA/APJ region model.
const LOCATIONS = [
  { region: 'AMER', location: 'United States', weight: 30 },
  { region: 'AMER', location: 'Canada', weight: 10 },
  { region: 'EMEA', location: 'Ireland', weight: 14 },
  { region: 'EMEA', location: 'Poland', weight: 11 },
  { region: 'APJ', location: 'India', weight: 24 },
  { region: 'APJ', location: 'Philippines', weight: 11 },
];

export function regionLocationBreakdown(total, seedKey) {
  const vals = splitByWeights(total || 0, LOCATIONS.map((l) => l.weight), seedKey);
  return LOCATIONS.map((l, i) => ({ region: l.region, location: l.location, value: vals[i] }));
}
