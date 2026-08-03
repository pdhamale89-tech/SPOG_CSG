import React from 'react'

const OPTIONS = ['Quarter', 'Month', 'Week']

// Page-wide time-granularity control, shared by both pages. Placed at the top-right
// of the filter bar rather than inside one of the value-filter clusters (Scope/Time/
// People/Geography): it changes *how every time-axis chart renders* (Year vs Quarter
// vs Month vs Week), not *which rows are in scope* the way the other filters do — so
// it reads as a view setting for the whole page, not one more value to pick from a
// list. Styled with the same label-above/control-below rhythm as every other filter
// field so it still feels native to the bar instead of bolted on.
//
// Unlike the DB/OSP pill, none of the three options is active by default — that
// no-selection state IS "Fiscal Year" (every chart's original default), matching how
// the value filters above it default to "All" rather than some pre-picked option.
// Clicking the already-active option toggles back to that default instead of forcing
// the user to always have one of Quarter/Month/Week selected.
export default function GranularityToggle({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1" style={{ flexShrink: 0 }}>
      <label style={{ fontSize: 8.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', paddingLeft: 1 }}>
        View By
      </label>
      <div className="drill-toggle">
        {OPTIONS.map(o => (
          <button key={o} onClick={() => onChange(value === o ? null : o)} className={`drill-btn${value === o ? ' active' : ''}`}>{o}</button>
        ))}
      </div>
    </div>
  )
}
