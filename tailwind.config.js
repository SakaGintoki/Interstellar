/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'space-gray': {
          DEFAULT: '#0d1117',
          light: '#161b22',
          dark: '#010409',
        },
        'accent-blue': {
          DEFAULT: '#3081f7',
          light: '#58a6ff',
        },
      },
    },
  },
  plugins: [],   // ← fix di sini
}
