/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'sagenex-emerald': '#41DA93',
        'sagenex-beige': '#EADFC1',
        'sagenex-black': '#0b0b0b',
      },
    },
  },
  plugins: [],
}