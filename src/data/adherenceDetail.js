// Pivot matrix for the Forecast Adherence detail view: Region -> Sub Region
// columns (each region group ending in its own Total column, plus a grand
// Total column) crossed with Offering -> Segment rows. Every offering
// (Basic/Premium/Prosupport) has a Cons/Comm/Overall breakdown so the modal
// can expand/collapse each offering to reveal or hide the segment split,
// plus a bottom grand Overall summary row. Values are deterministic
// (hash-derived, no Math.random/Date.now) so they stay stable across renders.
import { buildPivotMatrix } from './pivotMatrix';

const REGION_SUBS = {
  AMER: ['Brazil', 'MMCLA', 'NA'],
  APJ: ['ANZ', 'CCC', 'IND', 'JPN', 'KOR', 'SA'],
  EMEA: ['CER', 'NER', 'SER', 'UKI'],
};

export const MATRIX_REGIONS = Object.keys(REGION_SUBS);
export const MATRIX_SUBS_BY_REGION = REGION_SUBS;

const SEGMENTS = [{ key: 'cons', label: 'Consumer' }, { key: 'comm', label: 'Commercial' }];

export const ADHERENCE_MATRIX = buildPivotMatrix(MATRIX_REGIONS, REGION_SUBS, [
  { key: 'basic', label: 'Basic', segments: SEGMENTS },
  { key: 'premium', label: 'Premium', segments: SEGMENTS },
  { key: 'prosupport', label: 'Prosupport', segments: SEGMENTS },
]);
