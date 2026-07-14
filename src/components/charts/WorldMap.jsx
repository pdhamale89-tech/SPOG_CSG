import { useEffect, useRef } from 'react';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';
import 'jsvectormap/dist/jsvectormap.min.css';
import { COUNTRY_REGION, REGION_ACC } from '../../data/regions';
import { getColors } from '../../theme/colors';

export default function WorldMap({ theme }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.destroy();
      mapRef.current = null;
    }
    const c = getColors(theme);
    const colGreen = c.accentGreen;
    const colOrange = c.accentOrange;
    const colRed = c.accentRed;
    const neutralFill = c.bgFilter;
    const borderCol = c.border;

    mapRef.current = new jsVectorMap({
      selector: '#worldMap',
      map: 'world',
      zoomButtons: false,
      zoomOnScroll: false,
      draggable: true,
      regionsSelectable: false,
      backgroundColor: 'transparent',
      regionStyle: {
        initial: { fill: neutralFill, stroke: borderCol, strokeWidth: 0.5 },
        hover: { fillOpacity: 0.85, cursor: 'pointer' },
      },
      series: {
        regions: [{
          attribute: 'fill',
          scale: { AMER: colGreen, EMEA: colOrange, APJ: colRed },
          values: COUNTRY_REGION,
        }],
      },
      onRegionTooltipShow(event, tooltip, code) {
        const reg = COUNTRY_REGION[code];
        if (reg) {
          tooltip.text(`<strong>${tooltip.text()}</strong><br>Region: ${reg} &middot; Accuracy: ${REGION_ACC[reg]}%`, true);
        }
      },
    });

    return () => {
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, [theme]);

  return <div id="worldMap"></div>;
}
