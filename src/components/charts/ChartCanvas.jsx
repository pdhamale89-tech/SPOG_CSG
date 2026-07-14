import { useEffect, useRef } from 'react';
import { Chart } from './chartSetup';

export default function ChartCanvas({ config, height, onClick }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    if (!canvasRef.current || !config) return undefined;
    const finalConfig = onClickRef.current
      ? { ...config, options: { ...config.options, onClick: (evt, els) => onClickRef.current(evt, els) } }
      : config;
    chartRef.current = new Chart(canvasRef.current, finalConfig);
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  return (
    <div className="chart-container" style={height ? { height } : undefined}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
