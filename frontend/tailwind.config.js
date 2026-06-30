/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#030303', // Near pitch black
        panel: 'rgba(15, 15, 18, 0.7)', // Premium translucent dark gray card
        border: 'rgba(255, 255, 255, 0.08)', // Subtle white border
        accent: {
          DEFAULT: '#00F294', // Electric emerald/green
          hover: '#00D882',
          muted: 'rgba(0, 242, 148, 0.1)',
        },
        zinc: {
          850: '#1F1F23',
          900: '#18181B',
          950: '#09090B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .7 },
        }
      }
    },
  },
  plugins: [],
}
