/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vendrix design tokens
        surface: {
          base:    '#080C14',
          raised:  '#0D1220',
          overlay: '#111827',
          border:  '#1E2A3A',
          hover:   '#1A2436',
        },
        vendrix: {
          50:  '#eaf3ff',
          100: '#d0e7ff',
          200: '#a6cfff',
          300: '#6db0ff',
          400: '#3d8ef0',
          500: '#2563EB',
          600: '#1a4fcc',
          700: '#1540a8',
          800: '#0f307a',
          900: '#091f52',
        },
        accent: {
          DEFAULT: '#3d8ef0',
          glow:    'rgba(61,142,240,0.18)',
          border:  'rgba(61,142,240,0.35)',
        },
        muted: {
          DEFAULT: '#94A3B8',
          dim:     '#64748B',
          subtle:  '#334155',
        },
        success: { DEFAULT: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
        warning: { DEFAULT: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
        danger:  { DEFAULT: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)' },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        pill: '999px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,42,58,0.8)',
        glow:   '0 0 20px rgba(61,142,240,0.2)',
        'glow-sm': '0 0 10px rgba(61,142,240,0.15)',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        pulse2: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.4' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up':  'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':  'fadeIn 0.25s ease both',
        'shimmer':  'shimmer 1.6s infinite linear',
        'pulse2':   'pulse2 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease both',
      },
    },
  },
  plugins: [],
}
