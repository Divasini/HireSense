import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        // Obsidian Intelligence Brand Palette
        obsidian: {
          DEFAULT: '#0D1110',
          base: '#0D1110',
          dark: '#080B0A',
          card: '#151C19',
          elevated: '#1A2320',
          border: '#24322C',
        },
        charcoal: {
          DEFAULT: '#151C19',
          light: '#1D2723',
          border: '#26352F',
        },
        emerald: {
          DEFAULT: '#00B894',
          50: '#E6FAF5',
          100: '#C2F3E7',
          200: '#8BE8D2',
          300: '#54DCBD',
          400: '#26D0AA',
          500: '#00B894',
          600: '#009B7C',
          700: '#007A62',
          800: '#005947',
          900: '#00382D',
        },
        champagne: {
          DEFAULT: '#E8C97A',
          light: '#F4DE9C',
          dark: '#C8A959',
          border: '#E8C97A44',
          glow: '#E8C97A22',
        },
        sage: {
          DEFAULT: '#8FB9A8',
          light: '#B3D2C6',
          dark: '#6B9684',
          muted: '#AAB8B1',
        },
        'warm-white': '#F5F3EA',
        coral: {
          DEFAULT: '#E17055',
          light: '#FAB1A0',
          dark: '#D63031',
        },
        amber: {
          DEFAULT: '#F39C12',
          light: '#F8C291',
          dark: '#E67E22',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'emerald-glow': '0 0 20px -5px rgba(0, 184, 148, 0.35)',
        'champagne-glow': '0 0 24px -6px rgba(232, 201, 122, 0.35)',
        'obsidian-card': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
} satisfies Config

