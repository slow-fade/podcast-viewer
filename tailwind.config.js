/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tokyo: {
          bg: {
            primary: '#1a1b26',
            secondary: '#16161e',
            tertiary: '#1f2335',
            hover: '#292e42',
          },
          text: {
            primary: '#c0caf5',
            secondary: '#a9b1d6',
            muted: '#565f89',
          },
          accent: {
            blue: '#7aa2f7',
            purple: '#bb9af7',
            red: '#f7768e',
            orange: '#ff9e64',
            green: '#9ece6a',
            cyan: '#7dcfff',
            yellow: '#e0af68',
          },
          border: '#292e42',
        }
      },
      container: {
        responsive: {
          DEFAULT: '100%',
          'xl': '1280px',
          '2k': '1600px',
          '4k': '2048px',
        },
      },
    },
  },
  plugins: [],
}
