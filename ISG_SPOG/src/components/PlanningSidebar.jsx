import React, { Fragment, useState } from 'react'
import FiscalCalendarView from './FiscalCalendarView'
import PlanningCycleView from './PlanningCycleView'
import HolidayCalendarView from './HolidayCalendarView'

// Mounted once in App.jsx, outside the per-page conditional rendering, so its
// expand/collapse state survives switching between pages/tabs — this is what
// makes "add the calendar and planning cycle to all the pages" a single shared
// instance rather than something duplicated into every page component.
const SECTIONS = [
  { key: 'calendar', label: 'Fiscal Calendar', icon: '📅' },
  { key: 'cycle', label: 'Planning Cycle', icon: '🗓' },
  { key: 'holidays', label: 'Holiday Calendar', icon: '🌍' },
]

// Business switch tabs (2026-08-04) — added to the top of the rail so you can
// jump straight from ESG to HES (or back). Same key/label convention as App.jsx's
// BUSINESS_META ('msg'=ESG, 'tsa'=HES); kept local rather than importing
// BUSINESS_META since that also carries the header badge text this doesn't need.
// Each business's Forecasting/Capacity Plan sub-pages are listed underneath,
// same as CSG Sidebar's always-expanded sub-items (e.g. Forecast Overview/
// Shipment Overview/ASU Overview under Forecast) — both businesses' sub-lists
// stay visible regardless of which one is currently active.
const BUSINESSES = [
  {
    key: 'msg', label: 'ESG', icon: '🏢',
    subs: [
      { key: 'forecasting', label: 'ESG Forecasting' },
      { key: 'capacity', label: 'ESG Capacity Plan' },
    ],
  },
  {
    key: 'tsa', label: 'HES', icon: '🏭',
    subs: [
      { key: 'forecasting', label: 'HES Forecasting' },
      { key: 'capacity', label: 'HES Capacity Plan' },
    ],
  },
]

// Rail converted (2026-08-04) from a narrow icon-only strip to the same
// labeled-nav-list format as the CSG dashboard's left Sidebar: a brand row on
// top, section labels, then full-width icon+text rows with the same
// hover/active treatment. Clicking a Planning Tools row still opens the same
// content drawer to the right; clicking a business row or one of its
// Forecasting/Capacity Plan sub-rows navigates via onNavigate(businessKey,
// subPageKey) — App.jsx switches the top-level view and that business's
// remembered sub-page in one call.
export default function PlanningSidebar({ view, subPages, onNavigate }) {
  const [active, setActive] = useState(null)
  const activeSection = SECTIONS.find(s => s.key === active)

  return (
    <div style={{ display: 'flex', flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
      <div className="isg-sidebar">
        <div className="isg-sidebar-brand">
          <div className="isg-sidebar-logo">📊</div>
          <div>
            ISG SPoG
            <small>Planning Tools</small>
          </div>
        </div>
        <div className="isg-sidebar-nav">
          <div className="isg-sidebar-label">Business</div>
          {BUSINESSES.map(b => (
            <Fragment key={b.key}>
              <button
                onClick={() => onNavigate?.(b.key, subPages?.[b.key])}
                aria-label={b.label}
                aria-pressed={view === b.key}
                className={`isg-sb-i${view === b.key ? ' active' : ''}`}
              >
                <span className="ic">{b.icon}</span>{b.label}
              </button>
              <div className="isg-sb-sub">
                {b.subs.map(sp => (
                  <button
                    key={sp.key}
                    onClick={() => onNavigate?.(b.key, sp.key)}
                    aria-pressed={view === b.key && subPages?.[b.key] === sp.key}
                    className={`isg-sb-i${view === b.key && subPages?.[b.key] === sp.key ? ' active' : ''}`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </Fragment>
          ))}

          <div className="isg-sidebar-label">Planning Tools</div>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setActive(a => (a === s.key ? null : s.key))}
              aria-label={s.label}
              aria-pressed={active === s.key}
              className={`isg-sb-i${active === s.key ? ' active' : ''}`}
            >
              <span className="ic">{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection && (
        <div style={{
          width: 360, flexShrink: 0, background: 'var(--bg-page)', borderRight: '1px solid var(--border-subtle)',
          maxHeight: '100vh', overflowY: 'auto', animation: 'fade-in 0.15s ease-out',
        }}>
          <div className="layer-header" style={{ position: 'sticky', top: 0, zIndex: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeSection.icon} {activeSection.label}
            </span>
            <button
              onClick={() => setActive(null)}
              aria-label={`Close ${activeSection.label}`}
              style={{
                width: 20, height: 20, borderRadius: 5, border: 'none', background: 'transparent',
                color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ padding: 14 }}>
            {active === 'calendar' && <FiscalCalendarView />}
            {active === 'cycle' && <PlanningCycleView />}
            {active === 'holidays' && <HolidayCalendarView />}
          </div>
        </div>
      )}
    </div>
  )
}
