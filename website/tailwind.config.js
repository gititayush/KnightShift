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
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          400: '#38bdf8',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
          accent: '#6366f1',
          cyan: '#06b6d4',
        },
        dark: {
          base: '#08080a',
          surface: '#0d0e12',
          card: '#13151c',
          cardHover: '#181b24',
          border: '#222634',
          borderGlow: '#333b52'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'glow-accent': '0 0 35px -5px rgba(99, 102, 241, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s infinite alternate',
        'grid-flow': 'gridFlow 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(4deg)' },
        },
        pulseGlow: {
          '0%': { opacity: '0.4', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' },
          '100%': { opacity: '0.9', filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))' },
        },
        gridFlow: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' }
        }
      }
    },
  },
  plugins: [],
}
