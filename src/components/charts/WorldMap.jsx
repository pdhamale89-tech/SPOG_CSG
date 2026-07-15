import { useEffect, useRef } from 'react';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';
import 'jsvectormap/dist/jsvectormap.min.css';
import { COUNTRY_REGION, REGION_ACC, COUNTRY_ACC, MAJOR_COUNTRIES } from '../../data/regions';
import { getColors } from '../../theme/colors';

// Hand-picked on-land coordinates so region labels land in a recognizable spot
// instead of at an arbitrary country's bounding-box center.
const REGION_LABEL_COORDS = { AMER: [32, -97], EMEA: [50, 10], APJ: [19, 100] };

function tierKey(val) {
  if (val >= 75) return 'high';
  if (val >= 60) return 'mid';
  return 'low';
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
    const tierScale = { high: c.accentGreen, mid: c.accentOrange, low: c.accentRed };

    const seriesConfig = isCountry
      ? {
        attribute: 'fill',
        scale: tierScale,
        values: Object.keys(COUNTRY_ACC).reduce((acc, code) => {
          acc[code] = tierKey(COUNTRY_ACC[code]);
          return acc;
        }, {}),
      }
      : { attribute: 'fill', scale: { AMER: c.accentGreen, EMEA: c.accentOrange, APJ: c.accentRed }, values: COUNTRY_REGION };

    const labelHalo = { fill: '#fff', stroke: 'rgba(0,0,0,.6)', strokeWidth: 2, paintOrder: 'stroke', fontWeight: 700 };

    mapRef.current = new jsVectorMap({
      selector: '#worldMap',
      map: 'world',
      zoomButtons: false,
      zoomOnScroll: false,
      draggable: true,
      regionsSelectable: false,
      markersSelectable: false,
      backgroundColor: 'transparent',
      regionStyle: {
        initial: { fill: neutralFill, stroke: borderCol, strokeWidth: 0.5 },
        hover: { fillOpacity: 0.85, cursor: 'pointer' },
      },
      markerStyle: {
        initial: { r: 0, fill: 'transparent', stroke: 'transparent' },
        hover: { r: 0, fill: 'transparent', stroke: 'transparent', cursor: 'default' },
      },
      series: { regions: [seriesConfig] },
      markers: isCountry ? [] : Object.keys(REGION_LABEL_COORDS).map((reg) => ({ name: reg, coords: REGION_LABEL_COORDS[reg] })),
      labels: {
        regions: isCountry
          ? {
            render(code) {
              return MAJOR_COUNTRIES.includes(code) && COUNTRY_ACC[code] != null ? `${COUNTRY_ACC[code]}%` : '';
            },
          }
          : undefined,
        markers: isCountry
          ? undefined
          : {
            render(markerConfig) {
              const reg = markerConfig.name;
              return `${reg} ${REGION_ACC[reg]}%`;
            },
          },
      },
      regionLabelStyle: { initial: { ...labelHalo, fontSize: 8 } },
      markerLabelStyle: { initial: { ...labelHalo, fontSize: 11 } },
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
