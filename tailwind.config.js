const typography = require('@tailwindcss/typography')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        brand: {
          50: '#f0f2ff',
          100: '#e5e8fb',
          200: '#d0d5f2',
          300: '#b1b9e8',
          400: '#8994d6',
          500: '#6c74c0',
          600: '#555ba9',
          700: '#444891',
          800: '#353876',
          900: '#292b5a',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f3f3f2',
          200: '#eaeae8',
          300: '#dededc',
          400: '#b3b3b1',
          500: '#7f7f7d',
          600: '#5c5c5a',
          700: '#484846',
          800: '#2d2d2c',
          900: '#1e1e1d',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#2d2d2c',
            '--tw-prose-headings': '#1e1e1d',
            '--tw-prose-links': '#555ba9',
            '--tw-prose-bold': '#1e1e1d',
            '--tw-prose-quotes': '#5c5c5a',
            '--tw-prose-quote-borders': '#b1b9e8',
            '--tw-prose-bullets': '#6c74c0',
            '--tw-prose-hr': '#e0e0de',
            '--tw-prose-captions': '#7f7f7d',
            '--tw-prose-code': '#1e1e1d',
            '--tw-prose-pre-code': '#1e1e1d',
            '--tw-prose-pre-bg': '#f3f3f2',
            '--tw-prose-th-borders': '#e0e0de',
            '--tw-prose-td-borders': '#eaeae8',
            fontSize: '1rem',
            lineHeight: '1.9',
            maxWidth: '68ch',
            h2: {
              marginTop: '2.4em',
              fontWeight: '700',
            },
            h3: {
              marginTop: '2.1em',
              fontWeight: '700',
            },
            p: {
              marginTop: '1.2em',
            },
            code: {
              fontWeight: '500',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
}
