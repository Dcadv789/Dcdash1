/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        gray: {
          900: '#1A1A1A', // Ajustado para um tom mais claro
          800: '#1A1A1A',
          700: '#2C2C2C',
          600: '#3E3E3E',
          500: '#505050',
          400: '#A0A0A0',
          300: '#C0C0C0',
          200: '#E0E0E0',
          100: '#F0F0F0',
        },
        blue: {
          600: '#2563EB',
          700: '#1D4ED8',
        }
      },
      spacing: {
        '68': '17rem',
      },
    },
  },
  plugins: [],
};