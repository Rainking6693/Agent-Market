import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        fly: {
          primary: '#8C7BFF',
          primaryDark: '#5536DA',
          secondary: '#6B56FF',
          accent: '#F1EAFF',
          sidebar: 'rgba(17, 5, 38, 0.82)',
          surface: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.12)',
          foreground: '#F7F5FF',
          muted: '#C2BAFF',
        },
      },
      boxShadow: {
        'fly-card': '0px 40px 160px rgba(92, 70, 255, 0.25)',
      },
      fontFamily: {
        brand: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
