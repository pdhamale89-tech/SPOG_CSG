import { useEffect, useRef } from 'react';
import { Chart } from './chartSetup';
import { useApp } from '../../context/AppContext';
import { computeChartDrillDown } from '../../utils/drillDown';

const DRILLDOWN_SUBTITLE = 'Plan over Plan · Year on Year · Month on Month · Week on Week';

export default function ChartCanvas({ config, height, onClick }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const { curPeriod, openDrillDown } = useApp();
  const curPeriodRef = useRef(curPeriod);
  curPeriodRef.current = curPeriod;
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    if (!canvasRef.current || !config) return undefined;
    // A chart with a custom onClick (e.g. Partner Minimum's RCA flow) keeps that
    // behavior untouched; every other chart falls back to the generic drill-down.
    const handleClick = onClickRef.current
      ? (evt, els) => onClickRef.current(evt, els)
      : (evt, els) => {
        if (!els.length) return;
        const { datasetIndex, index } = els[0];
        const { pointLabel, seriesLabel, rows } = computeChartDrillDown({
          config: configRef.current, datasetIndex, dataIndex: index, curPeriod: curPeriodRef.current,
        });
        openDrillDown(seriesLabel ? `${seriesLabel} — ${pointLabel}` : pointLabel, DRILLDOWN_SUBTITLE, rows);
      };
    const handleHover = config.options?.onHover || ((evt, elements) => { evt.native.target.style.cursor = elements.length ? 'pointer' : 'default'; });
    const finalConfig = { ...config, options: { ...config.options, onClick: handleClick, onHover: handleHover } };
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
