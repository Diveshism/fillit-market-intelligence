import type { Config } from 'tailwindcss';

/**
 * Design system taken from FILLIT's own site, fillit.co, read September 2026:
 * the maroon #8D2635 that carries its testimonial cards and logo, the #05AF52
 * green of its Connect Now button, pure white paper, #333/#666 text greys, 16px
 * card radius and 50px pill buttons.
 *
 * Status colours keep the workbook's green-to-red semantics but are pulled onto
 * the brand scale: Hot is FILLIT's own green, Invalid its own maroon.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#8D2635',
          deep: '#8C0000',
          wash: '#FBF0F1',
        },
        green: {
          DEFAULT: '#05AF52',
          dark: '#1DA851',
        },
        ink: '#1A1A1A',
        graphite: '#5C5C5C',
        paper: '#FFFFFF',
        wash: '#F7F7F7',
        steel: '#6B7076',
        sand: '#C6C6C6',
        hairline: '#E3E3E3',
        status: {
          hot: '#05AF52',
          warm: '#4FBF7F',
          cold: '#A9DCC0',
          appointment: '#E0A020',
          revisit: '#D9772B',
          invalid: '#8D2635',
        },
      },
      fontFamily: {
        /* Gotham and Visby CF are licensed; Montserrat and Poppins are the
           closest geometric sans faces available to a static build. */
        display: ['var(--font-montserrat)', 'Gotham', 'Montserrat', 'sans-serif'],
        body: ['var(--font-poppins)', 'Visby CF', 'Poppins', 'sans-serif'],
      },
      letterSpacing: {
        display: '-0.02em',
        eyebrow: '0.1em',
      },
      borderRadius: {
        card: '16px',
        pill: '50px',
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
