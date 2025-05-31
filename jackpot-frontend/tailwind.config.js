/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00D4FF', // Sui Blue
        accent: '#FFE500', // Gold/Winner
        success: '#4CAF50', // Green
        danger: '#FF006E', // Pink/Urgent
        background: '#0A0E27', // Dark Blue
        surface: '#1A1F3A', // Card Background
      },
    },
  },
  plugins: [],
}