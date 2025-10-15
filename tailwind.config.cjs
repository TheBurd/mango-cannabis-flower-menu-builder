module.exports = {
  content: [
    './index.html',
    './{App,index}.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './hooks/**/*.{ts,tsx,js,jsx}',
    './utils/**/*.{ts,tsx,js,jsx}',
    './styles/**/*.{css,ts,tsx,js,jsx}',
    './constants.ts',
    './types.ts',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
