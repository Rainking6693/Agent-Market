import tailwindcssAnimate from 'tailwindcss-animate';

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: '#A39F9A', // Updated to new brand color for borders/dividers
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: '#333333', // Updated to new brand color for body text
        primary: {
          DEFAULT: '#9C6234', // Updated to new brand color for primary buttons/CTAs
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F2E8D5', // Carrara
          foreground: '#121212',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: '#F6EFE6', // Shell
          foreground: '#5A5249', // Ink Muted
        },
        accent: {
          DEFAULT: '#B18F4F', // Updated to new brand color for secondary actions/headings
          foreground: '#FFFFFF',
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
        brass: '#9C6234', // Updated to match new primary CTA color
        accentTone: '#8C7BFF',
        'accent-dark': '#5A3EE8',
        outline: '#A39F9A', // Updated to new brand color for borders/dividers
        sidebar: '#181514',
        success: '#2D5016',
        'success-light': '#4A7C2E',
        'antique-bronze': '#704A07',
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
        display: ['Bauer Bodoni', 'Bodoni MT', 'Bodoni', 'Baskerville', 'Baskerville Old Face', 'Goudy Old Style', 'Garamond', 'Times New Roman', 'serif'],
        body: ['Bauer Bodoni', 'Bodoni MT', 'Bodoni', 'Baskerville', 'Baskerville Old Face', 'Goudy Old Style', 'Garamond', 'Times New Roman', 'serif'],
        headline: ['Bauer Bodoni', 'Bodoni MT', 'Bodoni', 'Baskerville', 'Baskerville Old Face', 'Goudy Old Style', 'Garamond', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
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
