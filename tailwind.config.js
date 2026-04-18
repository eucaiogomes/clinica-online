/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"Fraunces"', 'serif'],
      },
      colors: {
        sage: {
          50: '#F4F7F4',
          100: '#E6EFE6',
          200: '#CEDBCE',
          300: '#A9C2A9',
          400: '#86A786',
          500: '#6B8C6B', // Main sage
          600: '#516E51',
          700: '#415841',
          800: '#344534',
          900: '#2A382A',
        },
        blush: {
          50: '#FDF8F6',
          100: '#FAEEEA',
          200: '#F3D9CF',
          300: '#EBBEAE',
          400: '#E19F8A',
          500: '#D5826A',
          600: '#C3634C',
          700: '#A14D38',
          800: '#864131',
          900: '#6E3A2D',
        },
        cream: {
          50: '#FFFEFC',
          100: '#FDFCF6', // Base backround
          200: '#F7F3E8',
          300: '#EBE4D5',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(107, 140, 107, 0.08), 0 2px 8px 0 rgba(107, 140, 107, 0.04)',
        'glass-hover': '0 12px 48px 0 rgba(107, 140, 107, 0.12), 0 4px 16px 0 rgba(107, 140, 107, 0.08)',
      }
    },
  },
  plugins:[],
}
