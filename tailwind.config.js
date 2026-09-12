/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#0e1117',
          card: '#161b22',
          border: '#30363d',
          accent: '#ef4444',
          accentHover: '#dc2626',
          rest: '#1f2937'
        }
      }
    },
  },
  plugins: [],
}
