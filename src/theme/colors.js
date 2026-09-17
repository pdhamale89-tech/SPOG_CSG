// Re-derived from the "CSG Productivity Console" Dell Design System v3
// reference artifact's --dds-color-*/--dv-cat-* tokens (same source as
// theme.css's app-wide CSS variables), so every chart, map and shared
// component using getColors() picks up the identical palette.
const palettes = {
  light: {
    textPrimary: '#1D2C3B',
    textSecondary: '#40586D',
    gridColor: '#C5D4E3',
    bgFilter: '#FFFFFF',
    bgCard: '#FFFFFF',
    border: '#C5D4E3',
    accentBlue: '#0672CB',
    accentGreen: '#4A7600',
    accentOrange: '#8C6200',
    accentRed: '#B32020',
    accentPurple: '#8A4FD6',
  },
  dark: {
    textPrimary: '#EBF1F6',
    textSecondary: '#A4B8CD',
    gridColor: '#293B4D',
    bgFilter: '#141D28',
    bgCard: '#141D28',
    border: '#293B4D',
    accentBlue: '#31A2E3',
    accentGreen: '#8ABF00',
    accentOrange: '#FFD666',
    accentRed: '#FF8080',
    accentPurple: '#A66CFF',
  },
};

export function getColors(theme) {
  return palettes[theme] || palettes.light;
}
