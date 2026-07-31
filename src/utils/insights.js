import { uppData, drillData } from '../data/forecastData';
import { REGION_ACC, accTier } from '../data/regions';

function sum(arr) { return arr.reduce((a, b) => a + b, 0); }
function avg(arr) { return sum(arr) / arr.length; }
function first(arr) { return arr[0]; }
function last(arr) { return arr[arr.length - 1]; }
function round(v) { return Math.round(v); }
function maxIdx(arr) { return arr.reduce((mi, v, i, a) => (v > a[mi] ? i : mi), 0); }
function minIdx(arr) { return arr.reduce((mi, v, i, a) => (v < a[mi] ? i : mi), 0); }
function labelAt(labels, i) { return labels?.[i] ?? `period ${i + 1}`; }
// Mirrors chartConfigs.js's own fK() so insight numbers match what each chart already displays.
function fK(v) { return Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}K` : `${Math.round(v)}`; }
const TIER_LABEL = { excellent: 'Excellent', good: 'Good', fair: 'Fair', critical: 'Critical' };
const cap = (s) => (s === 'oop' ? 'OOP' : s.charAt(0).toUpperCase() + s.slice(1));

// --- Forecast Overview ---

export function geoMapInsight() {
  const entries = Object.entries(REGION_ACC).sort((a, b) => b[1] - a[1]);
  const [bestReg, bestVal] = entries[0];
  const [worstReg, worstVal] = entries[entries.length - 1];
  return `${bestReg} leads at ${bestVal}% accuracy (${TIER_LABEL[accTier(bestVal)]}), while ${worstReg} trails at ${worstVal}% (${TIER_LABEL[accTier(worstVal)]}) — a ${bestVal - worstVal}-point gap between regions.`;
}

export function planOfferedInsight(d) {
  const offeredPct = d.offered.map((o, i) => (d.forecast[i] ? round((o / d.forecast[i]) * 100) : 0));
  const worstIdx = minIdx(offeredPct);
  return `Actual offered volume tracked at ${round(avg(offeredPct))}% of plan on average, dropping to a low of ${offeredPct[worstIdx]}% in ${labelAt(d.labels, worstIdx)} (${fK(d.offered[worstIdx])} offered vs ${fK(d.forecast[worstIdx])} planned).`;
}

export function callVolumeInsight(d) {
  const att = d.handled.map((h, i) => round((h / d.offered[i]) * 100));
  const abIdx = maxIdx(d.abandon);
  return `Offered% averaged ${round(avg(att))}% across the period; abandonment peaked at ${d.abandon[abIdx]}% in ${labelAt(d.labels, abIdx)} as offered volume reached ${fK(d.offered[abIdx])}.`;
}

export function channelMixInsight(d) {
  const chatDelta = Math.abs(last(d.chat) - first(d.chat));
  return `Voice share fell from ${first(d.voice)}% to ${last(d.voice)}% while Chat rose from ${first(d.chat)}% to ${last(d.chat)}%, a ${chatDelta}-point shift toward digital channels.`;
}

export function dbOspInsight(d) {
  const dbTotal = sum(d.dbVol);
  const ospTotal = sum(d.ospVol);
  const share = round((dbTotal / (dbTotal + ospTotal)) * 100);
  return `DB handled ${share}% of total volume (${fK(dbTotal)} vs ${fK(ospTotal)} OSP) over the period, with both channels trending upward.`;
}

export function dmsInsight(d) {
  return `Unassisted resolution rose from ${first(d.dmsUn)}% to ${last(d.dmsUn)}% while Assisted fell from ${first(d.dmsAs)}% to ${last(d.dmsAs)}%, reflecting a steady shift toward self-service.`;
}


export function histTrendInsight(d, curHistPlan) {
  const planLabel = curHistPlan === 'plan1' ? 'Jul Pro' : curHistPlan === 'plan2' ? 'Jun Pro' : 'Aug Pro';
  const pd = d[curHistPlan] || d.plan1;
  const gapAvg = round(avg(pd.map((v, i) => v - d.mlfc[i])));
  const dir = gapAvg >= 0 ? 'above' : 'below';
  return `The ${planLabel} plan runs ${Math.abs(gapAvg)} units ${dir} the ML forecast on average, versus FY2027 actuals of ${first(d.fy27act)} to ${last(d.fy27act)} over the same period.`;
}

// --- Capacity — Workforce Planning ---

export function capVolumeInsight(d) {
  const pctDiff = round((1 - sum(d.bTotal) / sum(d.aTotal)) * 100);
  const dir = pctDiff >= 0 ? 'below' : 'above';
  return `${d.periodB} projection volume runs ${Math.abs(pctDiff)}% ${dir} the ${d.periodA} plan across ${d.labels.length} periods, with OSP carrying the majority of both DB/OSP splits; total volume moved from ${fK(first(d.aTotal))} (${d.periodA}) to ${fK(last(d.bTotal))} (${d.periodB}).`;
}

export function capHcInsight(d) {
  return `Aug headcount average declined from ${first(d.augHcAvg)} to ${last(d.augHcAvg)}, while total HC dropped from ${first(d.julTotalHc)} (Jul) to ${last(d.augTotalHc)} (Aug) over the same span.`;
}

export function capExcessInsight(d) {
  return `Excess headcount eased from ${first(d.julExcessHc)} to ${last(d.augExcessHc)} across plans, with LOA exits narrowing from ${first(d.julLoaExit)} to ${last(d.augLoaExit)}.`;
}

export function capHiringInsight(d) {
  const zeroQtrs = d.augNew.filter((v) => v === 0).length;
  return `Aug hiring dropped to zero in ${zeroQtrs} of ${d.augNew.length} quarters versus the Jul plan, which never fell below ${Math.min(...d.julOld)} approved hires.`;
}

export function capHiringBreakdownInsight(d) {
  const approved = sum(d.julApproved) + sum(d.julUrHiring) + sum(d.augUrHiring);
  const nonApproved = sum(d.julNonApproved);
  const total = approved + nonApproved;
  return `Approved hiring accounts for ${approved} of the ${total} total hires tracked, versus ${nonApproved} still non-approved.`;
}

export function capCapOspInsight(d) {
  const validOsp = d.ospPctNew.filter((v) => v != null);
  return `Capacity% rose from ${first(d.capPctOld)}% to a peak of ${Math.max(...d.capPctNew)}% under the new plan, as OSP mix climbed to ${Math.max(...validOsp)}%.`;
}

export function capExitInsight(d) {
  return `L1 exit headcount fell from ${d.julL1Exit[0].toLocaleString()} (Jul) to ${last(d.augL1Exit)} (Aug), a swing of roughly ${last(d.exitPopPct)}% period-over-period.`;
}

export function capPopInsight(d) {
  const valid = d.totalVolPop.filter((v) => v != null);
  return `Total volume PoP% has stayed negative every quarter it's tracked, averaging ${round(avg(valid))}%, while HC Avg PoP% held steady near ${round(avg(d.hcAvgPop))}%.`;
}

export function capHiringPopInsight(d) {
  const worstIdx = minIdx(d.hiringPopDelta);
  return `Hiring PoP swung as low as ${d.hiringPopDelta[worstIdx]} in ${labelAt(d.labels, worstIdx)}, the sharpest quarter-over-quarter pullback in the series.`;
}

export function capPlannerGapInsight(d) {
  const totals = d.planners.map((p) => sum(p.data));
  const worstIdx = minIdx(totals);
  return `${d.planners[worstIdx].name} carries the largest cumulative gap at ${fK(totals[worstIdx])} across the period, ahead of ${d.planners.length - 1} other planners tracked.`;
}

export function capTopGapsInsight(d) {
  return `${d.labels[0]} leads all queues with a ${fK(d.gaps[0])} gap this quarter, more than double the tenth-ranked queue at ${fK(d.gaps[d.gaps.length - 1])}.`;
}

export function capOfferingGapInsight(d) {
  return `Pro carries the bulk of the offering gap at ${sum(d.pro)} across all quarters, dwarfing Premium (${sum(d.premium)}), OOP (${sum(d.oop)}) and Basic (${sum(d.basic)}) combined.`;
}

export function capPlannerSubtotalsInsight(d) {
  const totalFy27 = sum(d.fy27Total);
  const totalFy28 = sum(d.fy28Q1) + sum(d.fy28Q2);
  return `FY27 queue gaps total ${totalFy27} across these planners, with FY28 H1 already tracking ${totalFy28}; NA PON's -10 gap recurs as the largest single entry in FY27, FY28 Q1 and FY28 Q2.`;
}

export function capWeeklyGapInsight(d) {
  const worstIdx = minIdx(d.totalGap);
  return `Total weekly gap worsened to ${fK(d.totalGap[worstIdx])} in ${labelAt(d.labels, worstIdx)}, with Core Email and CommClient OOP the largest recurring contributors.`;
}

// --- Shipment / ASU ---

export function shipUppInsight(region, labels) {
  const ud = uppData[region] || uppData.Global;
  const diffs = ud.projection.map((p, i) => p - ud.shipAct[i]);
  const gapIdx = maxIdx(diffs);
  const upp1 = ud.upp1.filter((v) => v != null);
  const upp2 = ud.upp2.filter((v) => v != null);
  const dir = last(upp2) > last(upp1) ? 'more optimistic' : 'more conservative';
  return `Projection ran furthest ahead of actual shipments (+${diffs[gapIdx]}K) in ${labelAt(labels, gapIdx)}; the UPP2 scenario ends ${dir} than UPP1 (${last(upp2)}K vs ${last(upp1)}K by the final period).`;
}

const SHIP_VIEW_KEYS = {
  overall: ['overall'],
  offering: ['pro', 'premium', 'basic', 'oop'],
  segment: ['consumer', 'commercial', 'enterprise'],
};

export function shipDrillInsight(region, view, labels) {
  const dd = drillData[region] || drillData.Global;
  const keys = SHIP_VIEW_KEYS[view] || SHIP_VIEW_KEYS.overall;
  if (keys.length === 1) {
    const sd = dd[keys[0]];
    const peakIdx = maxIdx(sd.act);
    const dir = last(sd.proj) >= last(sd.act) ? 'above' : 'below';
    return `Overall actuals peaked at ${sd.act[peakIdx]}K in ${labelAt(labels, peakIdx)} before falling to ${last(sd.act)}K by period-end, while projections stayed ${dir} actuals throughout.`;
  }
  const totals = keys.map((k) => ({ k, actTotal: sum(dd[k].act), projTotal: sum(dd[k].proj) }));
  totals.sort((a, b) => b.actTotal - a.actTotal);
  const top = totals[0];
  const gapPct = round(((top.projTotal - top.actTotal) / top.actTotal) * 100);
  return `${cap(top.k)} leads with ${top.actTotal}K in cumulative actuals across the period; its projection ran ${gapPct >= 0 ? `${gapPct}% above` : `${Math.abs(gapPct)}% below`} actuals.`;
}

// Static/hardcoded builders below mirror the fixed arrays in chartConfigs.js — the
// region/period selectors on these tabs don't change these charts' underlying data.

export function shipmentTrendInsight() {
  const actual = [55, 58, 52, 60, 62, 65, 59, 64];
  const aop = [58, 60, 58, 63, 65, 68, 64, 68];
  const avgGap = round(avg(aop.map((v, i) => v - actual[i])));
  return `Actual shipments ran below AOP in every period, trailing by an average of ${avgGap}K units per month.`;
}

export function segmentSoldInsight(view = 'segment') {
  if (view === 'offering') {
    const basic = [17, 18, 16, 19, 19, 20, 18, 20];
    const oop = [8, 8, 8, 8, 8, 8, 8, 9];
    return `Basic remains the largest offering (${first(basic)}K→${last(basic)}K) and grew fastest, while OOP stayed roughly flat (${first(oop)}K→${last(oop)}K).`;
  }
  const commercial = [22, 24, 22, 25, 26, 27, 24, 27];
  const enterprise = [15, 15, 13, 15, 15, 16, 15, 16];
  return `Commercial remains the largest segment (${first(commercial)}K→${last(commercial)}K) and grew fastest, while Enterprise stayed roughly flat (${first(enterprise)}K→${last(enterprise)}K).`;
}

export function productTrendInsight() {
  const latitude = [22, 24, 21, 25, 26, 28, 24, 27];
  const precision = [12, 13, 11, 14, 14, 15, 13, 15];
  return `Latitude leads product volume (${first(latitude)}K→${last(latitude)}K) and keeps widening its gap over Precision, the smallest line (${first(precision)}K→${last(precision)}K).`;
}

export function shipmentGrowthInsight() {
  const data = { AMER: 42, EMEA: 28, APJ: 30 };
  const [topReg] = Object.entries(data).sort((a, b) => b[1] - a[1])[0];
  const rest = Object.entries(data).filter(([r]) => r !== topReg).map(([r, v]) => `${r} (${v}%)`).join(' and ');
  return `${topReg} drives the largest share of shipment growth at ${data[topReg]}%, ahead of ${rest}.`;
}

export function asuTrendInsight() {
  const asu = [1120, 1135, 1140, 1150, 1160, 1175, 1185, 1200];
  const plan = [1130, 1145, 1160, 1175, 1190, 1200, 1215, 1230];
  return `ASU grew from ${first(asu)}K to ${last(asu)}K but stayed behind Plan throughout, ending ${last(plan) - last(asu)}K short by period-end.`;
}

export function asuCpasuInsight() {
  const asu = [1120, 1135, 1140, 1150, 1160, 1175, 1185, 1200];
  const cpasu = [980, 990, 995, 1005, 1015, 1030, 1040, 1055];
  const share = round((last(cpasu) / last(asu)) * 100);
  return `CPASU has consistently trailed ASU by roughly ${round(avg(asu.map((v, i) => v - cpasu[i])))}K, running at about ${share}% of total ASU by period-end.`;
}

export function tagRouted2Insight(d) {
  const tagCount = d.labels.map((_, i) => d.tagWeb[i] + d.tagPhone[i] + d.tagChat[i] + d.tagEmail[i]);
  const pct = tagCount.map((c, i) => (d.offered[i] ? round((c / d.offered[i]) * 100) : 0));
  const worstIdx = minIdx(pct);
  const bestIdx = maxIdx(pct);
  return `Tag coverage of offered volume ranged from a low of ${pct[worstIdx]}% in ${labelAt(d.labels, worstIdx)} to a high of ${pct[bestIdx]}% in ${labelAt(d.labels, bestIdx)}.`;
}

export function exitTrendInsight() {
  return 'Total Shipment has declined for four straight fiscal years while ASU Exit has held roughly flat in the mid-20 millions; the FY26 forecast points to another modest step down.';
}

export function asuVolumeTrendInsight() {
  return 'Contact volume has trended down across the last two fiscal years as Tech Support ASU eased off its peak; the January projection revises the December view slightly lower heading into the new fiscal year.';
}

