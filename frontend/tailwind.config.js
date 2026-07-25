/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF6EC',
        paperDeep: '#F2EAD8',
        ink: '#2B2420',
        basil: {
          DEFAULT: '#2F4B33',
          light: '#3E6244',
          dark: '#1F3323',
        },
        saffron: {
          DEFAULT: '#E4A628',
          light: '#F0C05B',
          dark: '#B8830F',
        },
        tomato: {
          DEFAULT: '#C2461F',
          light: '#DA6A44',
          dark: '#983412',
        },
        sage: '#A9BBA0',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Public Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        card: '0 1px 2px rgba(43,36,32,0.06), 0 8px 20px -8px rgba(43,36,32,0.18)',
        cardHover: '0 2px 4px rgba(43,36,32,0.08), 0 16px 32px -12px rgba(43,36,32,0.28)',
      },
    },
  },
  plugins: [],
};
