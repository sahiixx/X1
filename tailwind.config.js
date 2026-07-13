/** @type {import('tailwindcss').Config} */
// Tailwind v4 is config-free by default. This file is a placeholder kept for
// reference; the project currently ships a pre-compiled stylesheet in
// src/index.css. Enable source-driven Tailwind via @tailwindcss/vite if needed.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};