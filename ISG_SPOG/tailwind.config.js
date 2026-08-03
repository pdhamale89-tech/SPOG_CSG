/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto Flex', 'system-ui', 'sans-serif'],
      },
      colors: {
        base:  '#0f1117',
        surf:  '#1a1d2e',
        raise: '#1e2235',
        inset: '#161929',
        navy: {
          900: '#0f1117',
          800: '#1a1d2e',
          700: '#1e2235',
          600: '#2d3148',
          500: '#374151',
          400: '#4b5563',
        },
        accent: {
          DEFAULT: '#60a5fa',
          dim:     'rgba(96,165,250,0.12)',
          glow:    'rgba(96,165,250,0.30)',
        },
        good:  '#10b981',
        warn:  '#f59e0b',
        bad:   '#ef4444',
      },
      boxShadow: {
        'card-idle':   '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
        'card-hover':  '0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(96,165,250,0.18)',
        'card-active': '0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(96,165,250,0.4), 0 0 20px rgba(96,165,250,0.1)',
        'panel':       '0 2px 8px rgba(0,0,0,0.4)',
        'glow-sm':     '0 0 12px rgba(96,165,250,0.35)',
      },
      backgroundImage: {
        'accent-line': 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
        'layer-head':  'linear-gradient(90deg, rgba(59,130,246,0.08) 0%, transparent 60%)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(-4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'pulse-soft': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
      },
      animation: {
        'fade-in':    'fade-in 0.18s ease-out',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
