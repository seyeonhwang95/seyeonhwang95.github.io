/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 24px 60px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
}
