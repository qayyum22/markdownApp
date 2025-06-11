module.exports = {
  content: [
    './src/index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {}
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};
