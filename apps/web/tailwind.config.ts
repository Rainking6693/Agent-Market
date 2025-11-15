import tailwindcssAnimate from 'tailwindcss-animate';

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        carrara: '#F2E8D5',
        shell: '#F6EFE6',
        surface: '#FBF5ED',
        surfaceAlt: '#EFE2D3',
        ink: '#121212',
        'ink-muted': '#5A5249',
        brass: '#C49A6C',
        accentTone: '#8C7BFF',
        'accent-dark': '#5A3EE8',
        outline: 'rgba(18, 18, 18, 0.08)',
        sidebar: '#181514',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
      },
      boxShadow: {
        'brand-panel': '0 28px 80px rgba(18, 18, 18, 0.12)',
        'accent-glow': '0 20px 45px rgba(140, 123, 255, 0.28)',
      },
      fontFamily: {
        display: ['Bodoni MT', 'Bodoni', 'Baskerville', 'Baskerville Old Face', 'Goudy Old Style', 'Garamond', 'Times New Roman', 'serif'],
        body: ['Bodoni MT', 'Bodoni', 'Baskerville', 'Baskerville Old Face', 'Goudy Old Style', 'Garamond', 'Times New Roman', 'serif'],
        headline: ['Bodoni MT', 'Bodoni', 'Baskerville', 'Baskerville Old Face', 'Goudy Old Style', 'Garamond', 'Times New Roman', 'serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
