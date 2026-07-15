import { useEffect, useRef } from 'react';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';
import 'jsvectormap/dist/jsvectormap.min.css';
import { COUNTRY_REGION, REGION_ACC, COUNTRY_ACC, REGION_ANCHOR, MAJOR_COUNTRIES } from '../../data/regions';
import { getColors } from '../../theme/colors';

function tierColor(val, c) {
  if (val >= 75) return c.accentGreen;
  if (val >= 60) return c.accentOrange;
  return c.accentRed;
}

export default function WorldMap({ theme, mode = 'region' }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.destroy();
      mapRef.current = null;
    }
    const c = getColors(theme);
    const neutralFill = c.bgFilter;
    const borderCol = c.border;
    const isCountry = mode === 'country';

    const seriesValues = isCountry
      ? Object.keys(COUNTRY_ACC).reduce((acc, code) => {
        acc[code] = tierColor(COUNTRY_ACC[code], c);
        return acc;
      }, {})
      : COUNTRY_REGION;

    const seriesConfig = isCountry
      ? { attribute: 'fill', values: seriesValues }
      : { attribute: 'fill', scale: { AMER: c.accentGreen, EMEA: c.accentOrange, APJ: c.accentRed }, values: seriesValues };

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
      series: { regions: [seriesConfig] },
      labels: {
        regions: {
          render(code) {
            if (isCountry) {
              return MAJOR_COUNTRIES.includes(code) && COUNTRY_ACC[code] != null ? `${COUNTRY_ACC[code]}%` : '';
            }
            const reg = COUNTRY_REGION[code];
            return reg && REGION_ANCHOR[reg] === code ? `${reg} ${REGION_ACC[reg]}%` : '';
          },
        },
      },
      regionLabelStyle: {
        initial: { fill: '#fff', stroke: 'rgba(0,0,0,.6)', 'stroke-width': 2, 'paint-order': 'stroke', 'font-size': isCountry ? 8 : 10, 'font-weight': 700 },
      },
      onRegionTooltipShow(event, tooltip, code) {
        if (isCountry) {
          const val = COUNTRY_ACC[code];
          if (val != null) tooltip.text(`<strong>${tooltip.text()}</strong><br>Accuracy: ${val}%`, true);
          return;
        }
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
  }, [theme, mode]);

  return <div id="worldMap"></div>;
}
