export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 20px 80px rgba(15, 23, 42, 0.18)',
      },
      colors: {
        midnight: '#090B16',
        nebula: '#2f1b8a',
        aurora: '#7c3aed',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top, rgba(102, 126, 234, .18), transparent 35%), radial-gradient(circle at right, rgba(236, 72, 153, .12), transparent 25%)',
      },
    },
  },
  plugins: [],
};
