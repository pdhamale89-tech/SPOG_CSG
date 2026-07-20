import { uppData, drillData, drillLabels, FM } from '../data/forecastData';
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

export function partnerInsight(d) {
  const pct = d.partActual.map((a, i) => (d.partForecast[i] ? round((a / d.partForecast[i]) * 100) : 0));
  const belowCount = pct.filter((p) => p < 80).length;
  const worstIdx = minIdx(pct);
  return `Actual/forecast attainment stayed below the 80% threshold in ${belowCount} of ${pct.length} periods, bottoming at ${pct[worstIdx]}% in ${labelAt(d.labels, worstIdx)}.`;
}

export function histTrendInsight(d, curHistPlan) {
  const planLabel = curHistPlan === 'plan1' ? 'Jul Pro' : curHistPlan === 'plan2' ? 'Jun Pro' : 'Aug Pro';
  const pd = d[curHistPlan] || d.plan1;
  const gapAvg = round(avg(pd.map((v, i) => v - d.mlfc[i])));
  const dir = gapAvg >= 0 ? 'above' : 'below';
  return `The ${planLabel} plan runs ${Math.abs(gapAvg)} units ${dir} the ML forecast on average, while the linear trend keeps declining from ${first(d.linTr)} to ${last(d.linTr)}.`;
}

// --- Forecast Health ---
// Stability/Drift series are hardcoded inside their chart builders (not sourced from
// forecastData.js), so these mirror those same fixed arrays rather than re-deriving them.

export function biasInsight(d) {
  const worstIdx = minIdx(d.bias);
  return `Forecast bias has run negative throughout the period (over-forecasting demand), widening from ${first(d.bias)}% to a worst of ${d.bias[worstIdx]}% in ${labelAt(d.labels, worstIdx)} before easing to ${last(d.bias)}%.`;
}

export function stabilityInsight(d) {
  const series = [85, 82, 78, 72, 68, 65, 62, 64];
  const belowIdx = series.findIndex((v) => v < 70);
  return `Forecast stability declined from ${series[0]}% to a low of ${Math.min(...series)}%, dropping below the 70% threshold in ${labelAt(d.labels, belowIdx)} before a slight rebound to ${last(series)}%.`;
}

export function driftInsight(d) {
  const series = [8, 10, 13, 16, 18, 20, 22, 19];
  const peakIdx = maxIdx(series);
  return `Model drift nearly tripled from an ${series[0]}% baseline to a peak of ${series[peakIdx]}% in ${labelAt(d.labels, peakIdx)} before easing to ${last(series)}%.`;
}

// --- Capacity — Workforce Planning ---

export function capVolumeInsight(d) {
  const julTotal = d.julDb.map((v, i) => v + d.julOsp[i]);
  const augTotal = d.augDb.map((v, i) => v + d.augOsp[i]);
  return `Aug projection volume runs ${round((1 - sum(augTotal) / sum(julTotal)) * 100)}% below the Jul plan across ${d.labels.length} quarters, with OSP carrying the majority of both DB/OSP splits.`;
}

export function capVolumeTrendInsight(d) {
  return `Total volume fell from ${fK(first(d.julTotal))} to ${fK(last(d.augTotal))} between the Jul and Aug projections, tracking closely against the ${fK(last(d.demandFcst))} demand forecast.`;
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
  return `Jul hiring leaned on ${sum(d.julNonApproved)} non-approved requisitions versus ${sum(d.julApproved)} approved, while Aug hiring of ${sum(d.augUrHiring)} was entirely UR-driven.`;
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

export function shipUppInsight(region) {
  const ud = uppData[region] || uppData.Global;
  const diffs = ud.projection.map((p, i) => p - ud.shipAct[i]);
  const gapIdx = maxIdx(diffs);
  const upp1 = ud.upp1.filter((v) => v != null);
  const upp2 = ud.upp2.filter((v) => v != null);
  const dir = last(upp2) > last(upp1) ? 'more optimistic' : 'more conservative';
  return `Projection ran furthest ahead of actual shipments (+${diffs[gapIdx]}K) in ${FM[gapIdx]}; the UPP2 scenario ends ${dir} than UPP1 (${last(upp2)}K vs ${last(upp1)}K by the final period).`;
}

export function shipDrillInsight(region, level, offering) {
  const dd = drillData[region] || drillData.Global;
  const key = level === 'overall' ? 'overall' : offering;
  const sd = dd[key] || dd.overall;
  const peakIdx = maxIdx(sd.act);
  const dir = last(sd.proj) >= last(sd.act) ? 'above' : 'below';
  return `${key === 'overall' ? 'Overall' : cap(key)} actuals peaked at ${sd.act[peakIdx]}K in ${drillLabels[peakIdx]} before falling to ${last(sd.act)}K by period-end, while projections stayed ${dir} actuals throughout.`;
}

// Static/hardcoded builders below mirror the fixed arrays in chartConfigs.js — the
// region/period selectors on these tabs don't change these charts' underlying data.

export function shipmentTrendInsight() {
  const actual = [55, 58, 52, 60, 62, 65, 59, 64];
  const aop = [58, 60, 58, 63, 65, 68, 64, 68];
  const avgGap = round(avg(aop.map((v, i) => v - actual[i])));
  return `Actual shipments ran below AOP in every period, trailing by an average of ${avgGap}K units per month.`;
}

export function segmentSoldInsight() {
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

export function tagRoutedInsight(d) {
  return `Web-originated cases rose from ${fK(first(d.tagWeb))} to ${fK(last(d.tagWeb))} and overtook Phone, which fell from ${fK(first(d.tagPhone))} to ${fK(last(d.tagPhone))} — a clear shift away from phone-based intake.`;
}

export function expiryInsight(d) {
  const peakIdx = maxIdx(d.expAssets);
  return `Assets nearing expiry peaked at ${fK(d.expAssets[peakIdx])} in ${labelAt(d.labels, peakIdx)}; Tech ASUs under support kept climbing to ${fK(last(d.expASU))}, tracking just behind the ${fK(last(d.expFcASU))} forecast.`;
}

export function asuAcqExitInsight() {
  const New = [18, 22, 15, 20, 24, 19, 21, 25];
  const Exit = [-12, -14, -10, -13, -15, -11, -14, -13];
  const netTotal = sum(New) + sum(Exit);
  return `Net ASU change stayed positive every month, adding ${netTotal}K net new ASUs over the period as New (avg ${round(avg(New))}K) consistently outpaced Exit (avg ${round(avg(Exit.map(Math.abs)))}K).`;
}

export function asuLifecycleInsight() {
  const stages = { Activated: 280, Active: 1200, Retained: 950, Renewed: 820 };
  const retainRate = round((stages.Retained / stages.Active) * 100);
  const renewRate = round((stages.Renewed / stages.Retained) * 100);
  return `Of ${stages.Active}K active ASUs, ${retainRate}% are retained (${stages.Retained}K) and ${renewRate}% of those go on to renew (${stages.Renewed}K).`;
}
