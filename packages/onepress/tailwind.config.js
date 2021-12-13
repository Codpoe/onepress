const path = require('path');
const colors = require('tailwindcss/colors');

const colorVars = [
  'c-brand',
  'c-brand-light',
  'c-bg',
  'c-bg-light',
  'c-bg-lighter',
  'c-bg-nav',
  'c-bg-sidebar',
  'c-text',
  'c-text-light',
  'c-text-lighter',
  'c-text-lightest',
  'c-text-accent',
  'c-divider',
  'c-divider-light',
  'code-bg',
  'code-highlight-bg',
  'code-line-number',
];

module.exports = {
  content: [
    path.resolve(__dirname, './dist/theme/**/*.{ts,tsx}').replace(/\\/g, '/'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      maxWidth: {
        '8xl': '90rem',
      },
      colors: colorVars.reduce(
        (acc, cur) => {
          acc[cur] = `var(--${cur})`;
          return acc;
        },
        {
          primary: colors.teal,
        }
      ),
    },
  },
};
