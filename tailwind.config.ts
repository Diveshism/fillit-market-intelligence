import type { Config } from 'tailwindcss';

/**
 * Design system is taken verbatim from the FILLIT brand specification
 * (Vision_Crafters_COMPLETE_HANDOFF.md, Appendix C) and mirrored in
 * fillit_dataset.json → summary.brand.
 *
 * Red is the only accent and must never exceed ~8% of a viewport.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#C91E2C',
          wash: '#FFF1F2',
        },
        ink: '#242126',
        graphite: '#3D4650',
        paper: '#F6F4F1',
        steel: '#41616F',
        sand: '#C9B89C',
        hairline: '#D8D3CC',
        status: {
          hot: '#2E7D4F',
          warm: '#7BA05B',
          cold: '#B8C4A8',
          appointment: '#D4A537',
          revisit: '#D07C2E',
          invalid: '#B33A3A',
        },
      },
      fontFamily: {
        display: ['var(--font-archivo)', 'Libre Franklin', 'Barlow', 'sans-serif'],
        body: ['var(--font-inter)', 'Source Sans 3', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.02em',
        eyebrow: '0.1em',
      },
      maxWidth: {
        shell: '88rem',
      },
      transitionTimingFunction: {
        entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
