import { useEffect, useRef, useState } from 'react';

export default function MultiSelectDropdown({ options, selected, onChange, suffix }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function toggle(opt) {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  }

  const buttonLabel = selected.length ? selected.map((s) => (suffix ? `${s} ${suffix}` : s)).join(', ') : 'Select…';

  return (
    <div className="multiselect" ref={rootRef}>
      <button type="button" className="f-sel multiselect-btn" onClick={() => setOpen((o) => !o)}>{buttonLabel} ▾</button>
      {open && (
        <div className="multiselect-menu">
          {options.map((opt) => (
            <label className="multiselect-item" key={opt}>
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              {suffix ? `${opt} ${suffix}` : opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
