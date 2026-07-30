// Partner Minimum / Partner Lock source data — ported as-is from the
// reference widget so its numbers stay reproducible: a fixed base queue
// list plus a seeded (not Math.random) generator that derives weekly/
// monthly/quarterly variants deterministically.
export const BASE_QUEUES = [
  { region: 'APJ', sub: 'IN', partner: 'Concentrix', queue: 'India Core Concentrix', target: 80, lock: 15604, actual: 8830 },
  { region: 'APJ', sub: 'IN', partner: 'Concentrix', queue: 'Client Prosupport IND CTX', target: 80, lock: 14094, actual: 9124 },
  { region: 'EMEA', sub: 'SER', partner: 'Foundever', queue: 'France CSQ Foundever', target: 80, lock: 3873, actual: 1555 },
  { region: 'EMEA', sub: 'CER', partner: 'CGS', queue: 'Germany Client Call Dir OSP', target: 80, lock: 1824, actual: 0 },
  { region: 'APJ', sub: 'CCC', partner: 'Brightway', queue: 'CHK Cons Tech CSQ BW', target: 80, lock: 1976, actual: 127 },
  { region: 'EMEA', sub: 'SER', partner: 'CGS', queue: 'Italy Client Call Dir OSP', target: 80, lock: 1930, actual: 405 },
  { region: 'Americas', sub: 'NA', partner: 'CGS', queue: 'NA DSP Cons CGS', target: 90, lock: 4917, actual: 3889 },
  { region: 'EMEA', sub: 'SER', partner: 'CGS', queue: 'Spain Client Call Dir OSP', target: 80, lock: 1060, actual: 386 },
  { region: 'APJ', sub: 'CCC', partner: 'Brightway', queue: 'CHK Cons XPS BW', target: 80, lock: 2382, actual: 1473 },
  { region: 'APJ', sub: 'SA', partner: 'Concentrix', queue: 'Client Prosupport ID (CTX)', target: 80, lock: 840, actual: 257 },
  { region: 'EMEA', sub: 'CER', partner: 'CGS', queue: 'Germany Client CGS', target: 80, lock: 1374, actual: 686 },
  { region: 'Americas', sub: 'LATAM', partner: 'Sitel', queue: 'ROLA Client Opti-Lat SITEL', target: 80, lock: 894, actual: 346 },
  { region: 'APJ', sub: 'IN', partner: 'CGS', queue: 'India Client DSP CGS', target: 90, lock: 4597, actual: 3773 },
  { region: 'EMEA', sub: 'NER', partner: 'Sitel', queue: 'NOR Client ProSupp Turku', target: 90, lock: 287, actual: 29 },
  { region: 'EMEA', sub: 'NER', partner: 'Sitel', queue: 'FIN Client ProSupp Turku', target: 90, lock: 555, actual: 276 },
  { region: 'APJ', sub: 'JPN', partner: 'Brightway', queue: 'Japan Comm PON BW', target: 80, lock: 2386, actual: 1694 },
  { region: 'EMEA', sub: 'NER', partner: 'Sitel', queue: 'DEN Client ProSupp Turku', target: 90, lock: 265, actual: 26 },
  { region: 'EMEA', sub: 'NER', partner: 'Sitel', queue: 'SWE Client ProSupp Turku', target: 90, lock: 442, actual: 203 },
  { region: 'EMEA', sub: 'UKI', partner: 'CGS', queue: 'UKI CSQ CGS', target: 80, lock: 2054, actual: 1478 },
  { region: 'Americas', sub: 'Brazil', partner: 'Sykes', queue: 'Brazil Cons Core Chat OSP', target: 80, lock: 1266, actual: 858 },
  { region: 'APJ', sub: 'ANZ', partner: 'Concentrix', queue: 'ANZ Commercial Client CTX', target: 80, lock: 974, actual: 627 },
  { region: 'EMEA', sub: 'EC', partner: 'Foundever', queue: 'Greece ProSupport Foundever', target: 80, lock: 559, actual: 306 },
];

function seededRng(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function genPeriod(key, vf) {
  const rng = seededRng(key.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  return BASE_QUEUES.map((q) => {
    const basePct = q.lock > 0 ? q.actual / q.lock : 0;
    const v = (rng() - 0.45) * vf;
    const pct = Math.max(0, Math.min(1, basePct + v));
    const lv = 1 + (rng() - 0.5) * 0.3;
    const nl = Math.round(q.lock * lv);
    return { ...q, lock: nl, actual: Math.round(nl * pct), pct: Math.round(pct * 100) };
  });
}

export const PARTNER_PERIODS = {
  weekly: { labels: ['Jul W1', 'Jul W2', 'Jul W3', 'Jul W4'], keys: ['jul_w1', 'jul_w2', 'jul_w3', 'jul_w4'], default: 3 },
  monthly: { labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024', 'Jul 2024'], keys: ['jan24', 'feb24', 'mar24', 'apr24', 'may24', 'jun24', 'jul24'], default: 6 },
  quarterly: { labels: ['Q1 FY24', 'Q2 FY24', 'Q3 FY24 (MTD)'], keys: ['q1_24', 'q2_24', 'q3_24'], default: 2 },
};

const allData = {};
Object.values(PARTNER_PERIODS).forEach((g) => {
  g.keys.forEach((k, i) => { allData[k] = genPeriod(k, 0.15 + i * 0.02); });
});
allData.jul24 = BASE_QUEUES.map((q) => ({ ...q, pct: q.lock > 0 ? Math.round((q.actual / q.lock) * 100) : 0 }));
allData.jul_w4 = BASE_QUEUES.map((q) => ({
  ...q, lock: Math.round(q.lock / 4), actual: Math.round(q.actual / 4),
  pct: q.lock > 0 ? Math.round((q.actual / q.lock) * 100) : 0,
}));

export function dataForKey(key) {
  return allData[key] || [];
}

export function partnerAgg(key) {
  const d = dataForKey(key);
  const partners = [...new Set(d.map((x) => x.partner))];
  return partners.map((p) => {
    const items = d.filter((x) => x.partner === p);
    const lock = items.reduce((s, x) => s + x.lock, 0);
    const actual = items.reduce((s, x) => s + x.actual, 0);
    const target = Math.round(items.reduce((s, x) => s + x.target, 0) / items.length);
    return {
      name: p, lock, actual,
      pct: lock > 0 ? Math.round((actual / lock) * 100) : 0,
      target, queues: items.length,
      regions: [...new Set(items.map((x) => x.region))].join(', '),
    };
  }).sort((a, b) => a.pct - b.pct);
}

export function queueAgg(key, partner) {
  return dataForKey(key)
    .filter((x) => x.partner === partner)
    .map((x) => ({ ...x, name: x.queue }))
    .sort((a, b) => a.pct - b.pct);
}
