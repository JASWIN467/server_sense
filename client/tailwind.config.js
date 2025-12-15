/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#0a0a0a',
        primary: '#0ea5e9', // Cyan
        secondary: '#d946ef', // Fuchsia
        accent: '#8b5cf6', // Violet
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(14, 165, 233, 0.5)',
        'neon-purple': '0 0 20px rgba(217, 70, 239, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
