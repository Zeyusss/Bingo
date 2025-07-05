/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx,html}',
    './app/**/*.{ts,tsx,js,jsx,html}',
    './pages/**/*.{ts,tsx,js,jsx,html}',
    './components/**/*.{ts,tsx,js,jsx,html}',
    '!./src/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '!./app/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '!./pages/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '!./components/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    // ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      fontFamily:{
        Poppins : ["var(--font-poppins)"]
      }
    },
  },
  plugins: [],
};
