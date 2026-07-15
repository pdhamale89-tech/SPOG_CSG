import { useEffect, useRef, useState } from 'react';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';
import 'jsvectormap/dist/jsvectormap.min.css';
import { COUNTRY_REGION, REGION_ACC, COUNTRY_ACC, MAJOR_COUNTRIES, accTier } from '../../data/regions';
import { getColors } from '../../theme/colors';

// Hand-picked on-land coordinates so region labels land in a recognizable spot
// instead of at an arbitrary country's bounding-box center.
const REGION_LABEL_COORDS = { AMER: [32, -97], EMEA: [50, 10], APJ: [19, 100] };

function tierColor(val, c) {
  const scale = { excellent: c.accentGreen, good: c.accentBlue, fair: c.accentOrange, critical: c.accentRed };
  return scale[accTier(val)];
}

export default function WorldMap({ theme, mode = 'region' }) {
  const mapRef = useRef(null);
  const [hover, setHover] = useState(null);
  const c = getColors(theme);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.destroy();
      mapRef.current = null;
    }
    setHover(null);
    const isCountry = mode === 'country';
    const tierScale = { excellent: c.accentGreen, good: c.accentBlue, fair: c.accentOrange, critical: c.accentRed };

    const seriesConfig = isCountry
      ? {
        attribute: 'fill',
        scale: tierScale,
        values: Object.keys(COUNTRY_ACC).reduce((acc, code) => {
          acc[code] = accTier(COUNTRY_ACC[code]);
          return acc;
        }, {}),
      }
      : {
        attribute: 'fill',
        scale: Object.keys(REGION_ACC).reduce((acc, reg) => {
          acc[reg] = tierScale[accTier(REGION_ACC[reg])];
          return acc;
        }, {}),
        values: COUNTRY_REGION,
      };

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
        initial: { fill: c.bgFilter, stroke: c.border, strokeWidth: 0.5 },
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
              return `${markerConfig.name} ${REGION_ACC[markerConfig.name]}%`;
            },
          },
      },
      regionLabelStyle: { initial: { ...labelHalo, fontSize: 8 } },
      markerLabelStyle: { initial: { ...labelHalo, fontSize: 11 } },
      // Kept enabled (but visually hidden via CSS) so this event still fires -
      // disabling showTooltip makes the library's own destroy() throw, since it
      // unconditionally calls the (then never-created) tooltip's .dispose().
      onRegionTooltipShow(event, tooltip, code) {
        if (isCountry) {
          const val = COUNTRY_ACC[code];
          if (val == null) return;
          const name = mapRef.current?._mapData?.paths?.[code]?.name || code;
          setHover({ label: name, value: val });
        } else {
          const reg = COUNTRY_REGION[code];
          if (!reg) return;
          setHover({ label: reg, value: REGION_ACC[reg] });
        }
      },
    });

    return () => {
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, mode]);

  return (
    <div className="geo-map-wrap">
      <div className="geo-legend">
        <span className="geo-legend-item"><span className="geo-legend-dot" style={{ background: c.accentGreen }}></span>&#8805;90% Excellent</span>
        <span className="geo-legend-item"><span className="geo-legend-dot" style={{ background: c.accentBlue }}></span>80&#8211;90% Good</span>
        <span className="geo-legend-item"><span className="geo-legend-dot" style={{ background: c.accentOrange }}></span>70&#8211;80% Fair</span>
        <span className="geo-legend-item"><span className="geo-legend-dot" style={{ background: c.accentRed }}></span>{'<'}70% Critical</span>
      </div>
      <div className="geo-map-inner" onMouseLeave={() => setHover(null)}>
        <div id="worldMap"></div>
        {hover && (
          <div className="geo-hover-card">
            <div className="geo-hover-name">{hover.label}</div>
            <div className="geo-hover-val" style={{ color: tierColor(hover.value, c) }}>{hover.value}%</div>
            <div className="geo-hover-sub">accuracy</div>
          </div>
        )}
      </div>
    </div>
  );
}
