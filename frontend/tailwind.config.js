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
        ner: {
          bg: '#070b14',
          card: '#0d1527',
          cardHover: '#131e38',
          border: '#1e293b',
          borderLight: '#334155',
          header: '#0b1329',
          primary: '#0284c7',
          primaryHover: '#0369a1',
          accent: '#38bdf8',
          safe: '#22c55e',
          safeBg: 'rgba(34, 197, 94, 0.12)',
          warning: '#f59e0b',
          warningBg: 'rgba(245, 158, 11, 0.12)',
          danger: '#ef4444',
          dangerBg: 'rgba(239, 68, 68, 0.12)',
          emergency: '#dc2626',
          muted: '#94a3b8',
          text: '#f1f5f9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-primary': '0 0 20px -3px rgba(2, 132, 199, 0.4)',
        'glow-safe': '0 0 20px -3px rgba(34, 197, 94, 0.4)',
        'glow-warning': '0 0 20px -3px rgba(245, 158, 11, 0.4)',
        'glow-danger': '0 0 25px -2px rgba(239, 68, 68, 0.5)',
        'tactical-card': '0 4px 20px -2px rgba(0, 0, 0, 0.6)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite'
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 0.3 }
        }
      }
    },
  },
  plugins: [],
}
