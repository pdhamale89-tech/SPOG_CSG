// Pivot matrix for the Shipment Adherence Detail table: same Region -> Sub
// Region layout as the Forecast Adherence Detail matrix, crossed with
// Offering -> Segment rows for shipment's own vocabulary (Pro/Premium/
// Basic/OOP offerings, each with an Enterprise/Commercial/Consumer split).
import { buildPivotMatrix } from './pivotMatrix';
import { MATRIX_REGIONS, MATRIX_SUBS_BY_REGION } from './adherenceDetail';

const SEGMENTS = [
  { key: 'ent', label: 'Enterprise' },
  { key: 'comm', label: 'Commercial' },
  { key: 'cons', label: 'Consumer' },
];

export const SHIP_ADHERENCE_MATRIX = buildPivotMatrix(MATRIX_REGIONS, MATRIX_SUBS_BY_REGION, [
  { key: 'ship-pro', label: 'Pro', segments: SEGMENTS },
  { key: 'ship-premium', label: 'Premium', segments: SEGMENTS },
  { key: 'ship-basic', label: 'Basic', segments: SEGMENTS },
  { key: 'ship-oop', label: 'OOP', segments: SEGMENTS },
]);
