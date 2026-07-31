// Regional ASU performance metrics (Basic/Pro/Premium volume + achievement
// %) for the table at the end of the ASU tab. These are user-supplied
// figures, not generated mock data - kept as literal values so they match
// the source numbers exactly.
export const ASU_TIERS = ['basic', 'pro', 'premium'];
export const ASU_TIER_LABELS = { basic: 'Basic', pro: 'Pro', premium: 'Premium' };

export const ASU_REGIONS = ['AMER', 'APJ', 'EMEA'];

export const ASU_SUBREGIONS_BY_REGION = {
  AMER: ['Brazil', 'MMCLA', 'NA'],
  APJ: ['ANZ', 'CCC', 'IN', 'JPN', 'KR', 'SA'],
  EMEA: ['Emerging', 'France', 'Germany', 'United Kingdom', 'Western Europe'],
};

export const ASU_ROWS = [
  { region: 'AMER', subRegion: 'Brazil', basic: { vol: '1.3M', pct: 93 }, pro: { vol: '180K', pct: 91 }, premium: { vol: '33K', pct: 87 } },
  { region: 'AMER', subRegion: 'MMCLA', basic: { vol: '1.9M', pct: 82 }, pro: { vol: '45K', pct: 65 }, premium: { vol: '3K', pct: 39 } },
  { region: 'AMER', subRegion: 'NA', basic: { vol: '21.3M', pct: 98 }, pro: { vol: '2.1M', pct: 99 }, premium: { vol: '491K', pct: 100 } },

  { region: 'APJ', subRegion: 'ANZ', basic: { vol: '448K', pct: 90 }, pro: { vol: '120K', pct: 98 }, premium: { vol: '31K', pct: 103 } },
  { region: 'APJ', subRegion: 'CCC', basic: { vol: '3.3M', pct: 104 }, pro: { vol: '850K', pct: 101 }, premium: { vol: '225K', pct: 97 } },
  { region: 'APJ', subRegion: 'IN', basic: { vol: '4.8M', pct: 104 }, pro: { vol: '310K', pct: 125 }, premium: { vol: '19K', pct: 144 } },
  { region: 'APJ', subRegion: 'JPN', basic: { vol: '922K', pct: 112 }, pro: { vol: '540K', pct: 110 }, premium: { vol: '286K', pct: 111 } },
  { region: 'APJ', subRegion: 'KR', basic: { vol: '235K', pct: 116 }, pro: { vol: '40K', pct: 108 }, premium: { vol: '3K', pct: 106 } },
  { region: 'APJ', subRegion: 'SA', basic: { vol: '914K', pct: 104 }, pro: { vol: '1.1M', pct: 105 }, premium: { vol: '571K', pct: 103 } },

  { region: 'EMEA', subRegion: 'Emerging', basic: { vol: '3.0M', pct: 103 }, pro: { vol: '150K', pct: 105 }, premium: { vol: '11K', pct: 112 } },
  { region: 'EMEA', subRegion: 'France', basic: { vol: '1.3M', pct: 99 }, pro: { vol: '240K', pct: 95 }, premium: { vol: '35K', pct: 92 } },
  { region: 'EMEA', subRegion: 'Germany', basic: { vol: '0.7M', pct: 96 }, pro: { vol: '280K', pct: 97 }, premium: { vol: '37K', pct: 99 } },
  { region: 'EMEA', subRegion: 'United Kingdom', basic: { vol: '1.8M', pct: 92 }, pro: { vol: '410K', pct: 96 }, premium: { vol: '77K', pct: 98 } },
  { region: 'EMEA', subRegion: 'Western Europe', basic: { vol: '2.1M', pct: 100 }, pro: { vol: '320K', pct: 102 }, premium: { vol: '40K', pct: 106 } },
];

export const ASU_REGION_TOTALS = {
  AMER: { basic: { vol: '24.4M', pct: 97 }, pro: { vol: '2.3M', pct: 98 }, premium: { vol: '526K', pct: 98 } },
  APJ: { basic: { vol: '10.6M', pct: 104 }, pro: { vol: '3.0M', pct: 106 }, premium: { vol: '1.1M', pct: 104 } },
  EMEA: { basic: { vol: '8.8M', pct: 99 }, pro: { vol: '1.4M', pct: 98 }, premium: { vol: '199K', pct: 99 } },
};

export const ASU_GLOBAL_TOTAL = { basic: { vol: '43.9M', pct: 99 }, pro: { vol: '6.7M', pct: 101 }, premium: { vol: '1860K', pct: 102 } };
