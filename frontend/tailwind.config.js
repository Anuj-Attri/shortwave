/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#08090f',
        accent: '#7c3aed',
        accent2: '#06b6d4',
      },
      boxShadow: {
        glow: '0 20px 80px rgba(124, 58, 237, 0.26)',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -4%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        drift: 'drift 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
