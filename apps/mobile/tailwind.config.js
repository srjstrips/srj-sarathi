/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // SRJ Steel Sarthi brand palette
        brand: {
          orange: '#F97316',      // primary CTA buttons
          'orange-dark': '#EA580C',
          'orange-light': '#FED7AA',
        },
        surface: {
          bg: '#F5F5F0',          // off-white app background
          card: '#FFFFFF',        // white cards
          border: '#E5E7EB',
        },
        text: {
          primary: '#111111',     // near-black body text
          secondary: '#6B7280',
          muted: '#9CA3AF',
          inverse: '#FFFFFF',
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
          info: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
    },
  },
  plugins: [],
};
