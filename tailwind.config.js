/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'display': ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        'heading': ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        'body': ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}