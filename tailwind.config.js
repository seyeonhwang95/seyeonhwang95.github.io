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
      colors: {
        'ink-strong': '#0f172a',
        'ink-muted': 'rgba(15, 23, 42, 0.65)',
        'primary': '#ff4d7d',
        'primary-foreground': '#ffffff',
        'secondary': '#f3f4f6',
        'secondary-foreground': '#1f2937',
        'destructive': '#ef4444',
        'destructive-foreground': '#ffffff',
        'background': '#ffffff',
        'foreground': '#1f2937',
        'accent': '#f3f4f6',
        'accent-foreground': '#1f2937',
        'input': '#e5e7eb',
        'ring': '#ff4d7d',
      },
      boxShadow: {
        'soft': '0 24px 60px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
}
