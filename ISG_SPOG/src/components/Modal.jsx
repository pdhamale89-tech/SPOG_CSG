import React from 'react'

// Shared popup modal used by both pages' Key Metrics cards (and any nested
// second-level drill, e.g. the Forecasting page's CQN Variance year-click list).
// Backdrop click or the ✕ closes it. Filters live one level up in each page's
// top-level component, so opening/closing this never touches filter state — the
// dashboard underneath is exactly as the user left it.
export function Modal({ title, onClose, children, width = 640 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(4,10,18,0.72)', backdropFilter: 'blur(3px)', padding: 20,
      }}
    >
      <div
        className="animate-fade-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-panel)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 12,
          padding: '16px 18px 14px', width: '100%', maxWidth: width, maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 30px rgba(56,189,248,0.08)',
        }}
      >
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textAlign: 'center' }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 0, top: -3, color: 'var(--text-faint)', fontSize: 18, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
