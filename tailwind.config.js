module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      margin: {
        'm-15': '3.75rem',
      },
      padding: {
        'py-2.5': '.65rem',
      },
      colors: {
        marketplaceColor: '#2db0ba',
        marketplaceColorDark: '#24949d',
      },
      font: {
        marketplace: 'Exo2',
      },
    },
  },
  variants: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
