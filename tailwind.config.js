/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kenya theme colors
        'kenya-green': '#006600',
        'kenya-black': '#000000',
        'kenya-red': '#FF0000',
        'kenya-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}