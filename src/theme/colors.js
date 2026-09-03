const palettes = {
  light: {
    textPrimary: '#1a1f36',
    textSecondary: '#6b7280',
    gridColor: 'rgba(0,0,0,.06)',
    bgFilter: '#eef1f6',
    bgCard: '#ffffff',
    border: '#e5e7eb',
    accentBlue: '#0672CB',
    accentGreen: '#5D8C00',
    accentOrange: '#C96100',
    accentRed: '#D0353F',
    accentPurple: '#994CCC',
  },
  dark: {
    textPrimary: '#e5e7eb',
    textSecondary: '#9ca3af',
    gridColor: 'rgba(255,255,255,.06)',
    bgFilter: '#161929',
    bgCard: '#1e2235',
    border: '#2d3148',
    accentBlue: '#31A2E3',
    accentGreen: '#9BC438',
    accentOrange: '#F8A433',
    accentRed: '#FE6B73',
    accentPurple: '#C47AF4',
  },
};

export function getColors(theme) {
  return palettes[theme] || palettes.light;
}
