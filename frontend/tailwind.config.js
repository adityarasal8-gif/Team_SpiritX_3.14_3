/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'status-green': '#10b981',
        'status-yellow': '#f59e0b',
        'status-red': '#ef4444',
      }
    },
  },
  plugins: [],
}
