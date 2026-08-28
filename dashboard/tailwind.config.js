/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#080d1a',
        },
        danger: {
          light: '#f87171',
          DEFAULT: '#ef4444',
          dark: '#b91c1c',
          glow: '#dc2626',
        },
        warning: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          glow: '#f59e0b',
        },
        safe: {
          light: '#4ade80',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        guardian: {
          blue: '#0284c7',
          cyan: '#38bdf8',
          accent: '#06b6d4',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'wave': 'waveBar 1.2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.8))' },
          '50%': { opacity: 0.7, filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.4))' },
        },
        waveBar: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '36px' },
        }
      }
    },
  },
  plugins: [],
}
