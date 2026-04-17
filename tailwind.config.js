/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:     ['Josefin Sans', 'system-ui', 'sans-serif'],
        heading:  ['Oswald', 'system-ui', 'sans-serif'],
        sub:      ['Josefin Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        toucan: {
          cream:   '#FAF8F2',
          gray:    '#7C7C7C',
          silver:  '#929799',
          blush:   '#c8aa9d',
          sky:     '#afd8ea',
          yellow:  '#ffeea2',
          peach:   '#fbab98',
          coral:   '#ed7979',
          dark:    '#1E1916',
          darkHover: '#2d2520',
        },
      },
    },
  },
  plugins: [],
}
