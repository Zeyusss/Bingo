/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    "./src/**/*.{ts,tsx,js,jsx}",
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
//     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      fontFamily :{
        Roboto : ["var(--font-roboto)"],
        Poppins : ["var(--font-poppins)"]
      }, keyframes: {
        scroll: {
          '0%': { transform: 'translate(0%)' },
          '95%': { transform: 'translate(-95%)' }
        },
        scrollReverse: {
          '0%': { transform: 'translate(-55%)' },
          '95%': { transform: 'translate(55%)' }
        }
      },
      animation: {
        scroll: 'scroll 100s infinite',
        scrollReverse: 'scrollReverse 100s infinite',
      },
      fontFamily: {
        Roboto: ['var(--font-roboto)'],
        Poppins: ['var(--font-poppins)']
      }
    }
  },
  plugins: [],
};
