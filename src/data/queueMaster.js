// Shared combined-queue reference list used to break any chart's series
// totals down by queue/region/sub region/country in the drill-down's Queue
// Detail table. Weights sum to 1 so a series' queue rows always add back up
// to the real total already shown on the chart.
export const QUEUE_MASTER = [
  { queue: 'Enterprise Voice T1', region: 'AMER', subRegion: 'NA', country: 'US', weight: 0.22 },
  { queue: 'Commercial Voice T2', region: 'APJ', subRegion: 'SA', country: 'Singapore', weight: 0.14 },
  { queue: 'Consumer Chat', region: 'APJ', subRegion: 'CCC', country: 'China', weight: 0.16 },
  { queue: 'OOP Support', region: 'AMER', subRegion: 'MMCLA', country: 'Mexico', weight: 0.08 },
  { queue: 'Enterprise Email', region: 'EMEA', subRegion: 'UKI', country: 'United Kingdom', weight: 0.12 },
  { queue: 'Commercial Chat', region: 'EMEA', subRegion: 'NER', country: 'Germany', weight: 0.10 },
  { queue: 'Technical Support Voice', region: 'APJ', subRegion: 'IN', country: 'India', weight: 0.11 },
  { queue: 'Billing Queue', region: 'AMER', subRegion: 'Brazil', country: 'Brazil', weight: 0.07 },
];
