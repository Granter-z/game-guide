/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff4757',
        secondary: '#c44569',
        dark: '#151515',
        card: '#242424',
        sidebar: '#1e1e1e',
      }
    },
  },
  plugins: [],
}
