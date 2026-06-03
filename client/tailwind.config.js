export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0f172a', 900: '#111827', 800: '#1f2937' },
        gold: { DEFAULT: '#d4af37', soft: '#e8c971' }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui']
      },
      backdropBlur: { xs: '2px' }
    }
  },
  plugins: []
};
