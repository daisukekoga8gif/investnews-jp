/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#293548',
          850: '#172032',
          950: '#0a0f1e',
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};
