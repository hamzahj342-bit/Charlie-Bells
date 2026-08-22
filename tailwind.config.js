/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F3BF4B',
          primaryHover: '#DE9E32',
          charcoal: '#231815',
          charcoalDeep: '#150C0A',
          background: '#FAF8F5',
          surface: '#FFFFFF',
          text: '#231815',
          muted: '#A89F91',
          border: '#E8DFD1',
        },
      },
      boxShadow: {
        brand: '0 10px 25px -8px rgba(243, 191, 75, 0.35)',
      },
    },
  },
  plugins: [],
}
