/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aim: {
          navy: '#0B1B3A',
          'navy-light': '#122654',
          'navy-muted': '#1A3366',
          'navy-card': '#0F2248',
          gold: '#F5A623',
          'gold-light': '#F7B84D',
          'gold-dark': '#D4890F',
          purple: '#5C2D91',
          'purple-light': '#7A3DB8',
          'purple-dark': '#4A2475',
        },
      },
      boxShadow: {
        'brand-gold': '0 4px 24px -4px rgba(245, 166, 35, 0.25)',
        'brand-purple': '0 4px 24px -4px rgba(92, 45, 145, 0.25)',
        'card-depth': '0 4px 24px -8px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
