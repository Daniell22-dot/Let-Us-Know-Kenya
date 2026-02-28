/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional color palette with Kenya accent
        'luk-primary': '#1e293b',      // Slate dark blue
        'luk-secondary': '#64748b',    // Slate gray
        'luk-accent': '#d97706',       // Warm amber (professional accent)
        'luk-success': '#059669',      // Kenya green (refined)
        'luk-danger': '#dc2626',       // Clean danger red
        'luk-info': '#0284c7',         // Professional blue
        'luk-light': '#f1f5f9',        // Light background
        'luk-border': '#e2e8f0',       // Border gray
        // Kenya brand colors (used sparingly as accents)
        'kenya-black': '#1f2937',      // Refined black
        'kenya-red': '#c41e3a',        // Professional red
        'kenya-green': '#00a84f',      // Professional green
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}