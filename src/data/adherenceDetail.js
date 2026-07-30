// Region / Sub Region / Country / Offering level forecast adherence for the
// Forecast Adherence detail table. Countries and their region-level accuracy
// already exist in regions.js — this only adds the two dimensions that
// don't: a Sub Region bucket per country and a per-Offering split, both
// deterministically derived (same hash-variance technique regions.js already
// uses for COUNTRY_ACC) so numbers stay stable across renders.
import { COUNTRY_ACC, COUNTRY_REGION, MAJOR_COUNTRIES } from './regions';

const SUB_REGIONS = {
  AMER: ['NA', 'MMCLA', 'Brazil'],
  EMEA: ['UKI', 'NER', 'SER', 'CER', 'EC'],
  APJ: ['CCC', 'IN', 'JPN', 'KOR', 'SA', 'ANZ'],
};

const OFFERINGS = ['Pro', 'Premium', 'Basic', 'OOP'];

const COUNTRY_NAMES = {
  US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil', AR: 'Argentina',
  GB: 'United Kingdom', DE: 'Germany', FR: 'France', ES: 'Spain', IT: 'Italy',
  RU: 'Russia', CN: 'China', JP: 'Japan', IN: 'India', AU: 'Australia',
  ZA: 'South Africa', SA: 'Saudi Arabia', KR: 'Korea', ID: 'Indonesia', NG: 'Nigeria',
};

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function subRegionFor(code, region) {
  const opts = SUB_REGIONS[region] || SUB_REGIONS.AMER;
  return opts[hashCode(code) % opts.length];
}

export const ADHERENCE_ROWS = MAJOR_COUNTRIES.flatMap((code) => {
  const region = COUNTRY_REGION[code];
  const subRegion = subRegionFor(code, region);
  const countryAcc = COUNTRY_ACC[code];
  return OFFERINGS.map((offering) => {
    const variance = (hashCode(code + offering) % 13) - 6; // -6..+6
    return {
      region,
      subRegion,
      country: COUNTRY_NAMES[code] || code,
      offering,
      adherence: clamp(countryAcc + variance, 25, 98),
    };
  });
});
