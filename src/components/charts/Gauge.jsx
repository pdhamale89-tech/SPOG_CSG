import { useEffect, useRef } from 'react';
import { getColors } from '../../theme/colors';

export default function Gauge({ value, max = 100, theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    c.width = 110;
    c.height = 60;
    const cx = 55, cy = 58, r = 45;
    const sa = Math.PI, ea = 2 * Math.PI;
    const va = sa + (value / max) * (ea - sa);
    ctx.clearRect(0, 0, 110, 60);
    ctx.beginPath();
    ctx.arc(cx, cy, r, sa, ea);
    ctx.lineWidth = 8;
    ctx.strokeStyle = getColors(theme).bgFilter;
    ctx.stroke();
    let col = '#10b981';
    if (value < 60) col = '#ef4444';
    else if (value < 75) col = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx, cy, r, sa, va);
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = col;
    ctx.stroke();
  }, [value, max, theme]);

  return (
    <div className="gauge-wrap">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
