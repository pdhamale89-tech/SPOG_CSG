// Region x Sub Region x Offering contact volume detail (FY24-FY27), for the
// "Contact Volume Detail" table above Queue Performance. Reuses the same
// Region/Sub Region taxonomy as the Forecast Adherence Detail matrix
// (SUBREGIONS_BY_REGION) so the two tables speak the same geography.
// All numbers are deterministic (hash-derived, no Math.random/Date.now).
import { SUBREGIONS_BY_REGION } from './regions';

export const CV_OFFERINGS = ['Basic', 'Premium', 'Prosupport'];
export const CV_FY_KEYS = ['fy24', 'fy25', 'fy26', 'fy27'];
export const CV_FY_LABELS = ['FY24', 'FY25', 'FY26', 'FY27'];
export const CV_CHANNELS = ['Chat Mix', 'Email Mix', 'Voice Mix', 'Social Mix'];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function buildRow(region, subRegion, offering) {
  const key = `${region}|${subRegion}|${offering}`;

  // Contact volume: FY24 baseline, then a declining trend each year.
  const baseVol = 1.2 + (hashCode(`${key}|vol`) % 46) / 10; // 1.2..5.7 M
  const volumes = [baseVol];
  CV_FY_KEYS.slice(1).forEach((fy) => {
    const rate = 0.16 + (hashCode(`${key}|${fy}|decline`) % 16) / 100; // 16%..31%
    volumes.push(volumes[volumes.length - 1] * (1 - rate));
  });
  const contactVolume = {};
  const volYoY = {};
  CV_FY_KEYS.forEach((fy, i) => {
    contactVolume[fy] = `${volumes[i].toFixed(2)} M`;
    volYoY[fy] = i === 0 ? '—' : `${Math.round(((volumes[i] - volumes[i - 1]) / volumes[i - 1]) * 100)}%`;
  });

  // Channel mix: Chat/Email drift up and Voice drifts down year over year;
  // Social is always the remainder so every year's mix sums to exactly 100.
  const chatBase = 4 + (hashCode(`${key}|chat`) % 10); // 4..13
  const emailBase = 6 + (hashCode(`${key}|email`) % 14); // 6..19
  const voiceBase = 42 + (hashCode(`${key}|voice`) % 18); // 42..59
  const channels = {};
  CV_CHANNELS.forEach((ch) => { channels[ch] = {}; });
  CV_FY_KEYS.forEach((fy, i) => {
    const chat = chatBase + i;
    const email = emailBase + i * 2;
    const voice = Math.max(20, voiceBase - i * 5);
    const social = 100 - chat - email - voice;
    channels['Chat Mix'][fy] = `${chat}%`;
    channels['Email Mix'][fy] = `${email}%`;
    channels['Voice Mix'][fy] = `${voice}%`;
    channels['Social Mix'][fy] = `${social}%`;
  });

  // Partner mix: rising trend toward outsourcing over the FY24-27 window.
  const partnerBase = 55 + (hashCode(`${key}|partner`) % 20); // 55..74
  const partnerMix = {};
  CV_FY_KEYS.forEach((fy, i) => {
    const step = 6 + (hashCode(`${key}|${fy}|partner`) % 5); // 6..10 pts/yr
    partnerMix[fy] = `${clamp(partnerBase + i * step, 0, 99)}%`;
  });

  return { region, subRegion, offering, contactVolume, volYoY, channels, partnerMix };
}

export const CONTACT_VOLUME_ROWS = Object.keys(SUBREGIONS_BY_REGION).flatMap((region) => SUBREGIONS_BY_REGION[region]
  .flatMap((subRegion) => CV_OFFERINGS.map((offering) => buildRow(region, subRegion, offering))));

export const CV_REGIONS = Object.keys(SUBREGIONS_BY_REGION);
export const CV_SUBREGIONS = [...new Set(CONTACT_VOLUME_ROWS.map((r) => r.subRegion))];
