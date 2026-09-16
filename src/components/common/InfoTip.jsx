import { useEffect, useRef } from 'react';

export default function InfoTip() {
  const tipRef = useRef(null);

  useEffect(() => {
    const tip = tipRef.current;
    let hideTimer;
    function onOver(e) {
      const btn = e.target.closest('.info-btn');
      if (!btn) return;
      clearTimeout(hideTimer);
      tip.innerHTML = btn.dataset.tip || '';
      const r = btn.getBoundingClientRect();
      tip.style.left = Math.min(r.left, window.innerWidth - 288) + 'px';
      tip.style.top = (r.bottom + 8) + 'px';
      tip.classList.add('show');
    }
    function onOut(e) {
      if (!e.target.closest('.info-btn')) return;
      hideTimer = setTimeout(() => tip.classList.remove('show'), 100);
    }
    // Keyboard users can't hover -- Tab focus/blur on the info-btn opens and
    // closes the same tooltip, per the "reachable via Tab" accessibility note.
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('focusin', onOver);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('focusin', onOver);
      document.removeEventListener('focusout', onOut);
      clearTimeout(hideTimer);
    };
  }, []);

  return <div id="globalInfoTip" ref={tipRef}></div>;
}
