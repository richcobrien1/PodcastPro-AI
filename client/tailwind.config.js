/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          dark: '#764ba2',
        },
        accent: {
          DEFAULT: '#f59e0b',
          dark: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
