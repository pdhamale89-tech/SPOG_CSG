import React from 'react'

export default function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-1">
      <span className="text-[10px] font-bold tracking-[0.15em] uppercase"
        style={{ color: 'var(--accent)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(56,189,248,0.3), transparent)' }} />
    </div>
  )
}
