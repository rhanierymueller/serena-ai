/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        fadeOutToBlack: 'fadeOutToBlack 0.6s ease-in-out forwards',
      },
      backgroundImage: {
        'ancient-pattern': "url('/image/foto_egipcia.png')",
      },
      keyframes: {
        fadeOutToBlack: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        typing: 'typing 2s steps(30, end) forwards',
      },
    },
  },
  plugins: [],
};
