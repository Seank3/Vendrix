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
        background: {
          DEFAULT: '#0a0a0a',
          secondary: '#111111',
          tertiary: '#1a1a1a',
          overlay: 'rgba(255, 255, 255, 0.05)',
        },
        foreground: {
          DEFAULT: '#ffffff',
          secondary: '#a3a3a3',
          muted: '#737373',
        },
        border: {
          DEFAULT: '#2a2a2a',
          light: '#333333',
        },
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          dark: '#1d4ed8',
        },
        success: {
          DEFAULT: '#10b981',
          light: 'rgba(16, 185, 129, 0.1)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: 'rgba(245, 158, 11, 0.1)',
        },
        error: {
          DEFAULT: '#ef4444',
          light: 'rgba(239, 68, 68, 0.1)',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: 'rgba(59, 130, 246, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 1.5s ease-in-out infinite',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}