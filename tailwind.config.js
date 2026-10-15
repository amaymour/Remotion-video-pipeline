/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: { 900: "#0f172a", 800: "#1e293b", 700: "#334155" },
        indigo: { 500: "#6366f1", 400: "#818cf8" },
      },
    },
  },
  plugins: [],
}
