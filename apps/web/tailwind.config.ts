import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        carrara: '#F2E8D5',
        shell: '#F6EFE6',
        surface: '#FBF5ED',
        surfaceAlt: '#EFE2D3',
        ink: '#121212',
        'ink-muted': '#5A5249',
        brass: '#C49A6C',
        accent: '#8C7BFF',
        'accent-dark': '#5A3EE8',
        outline: 'rgba(18, 18, 18, 0.08)',
        sidebar: '#181514',
      },
      boxShadow: {
        'brand-panel': '0 28px 80px rgba(18, 18, 18, 0.12)',
        'accent-glow': '0 20px 45px rgba(140, 123, 255, 0.28)',
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'sans-serif'],
        body: ['var(--font-body)', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
