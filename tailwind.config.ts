import type { Config } from 'tailwindcss';

const colors = {
  'bg-primary': 'var(--bg-primary)',
  'bg-secondary': 'var(--bg-secondary)',
  'bg-tertiary': 'var(--bg-tertiary)',
  'text-primary': 'var(--text-primary)',
  'text-secondary': 'var(--text-secondary)',
  'text-muted': 'var(--text-muted)',
  'accent-cyan': 'var(--accent-cyan)',
  'gain': 'var(--gain)',
  'loss': 'var(--loss)',
  'warning': 'var(--warning)',
};

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      borderColor: { DEFAULT: 'var(--border)' },
      boxShadow: {
        glow: '0 0 0 1px rgba(148,163,184,0.2), 0 10px 30px rgba(15,23,42,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
