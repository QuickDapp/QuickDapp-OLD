/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '0.5rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      height: {
        header: '56px',
        screen_minus_header: 'calc(100vh - 56px)',
      },
      margin: {
        after_header: '56px 0 0',
      },
      colors: {
        background: '#000',
        foreground: '#fff',
        anchor: '#0ec8ff',
      },
      borderRadius: {
        lg: `0.5rem`,
        md: `calc(0.5rem - 2px)`,
        sm: 'calc(0.5rem - 4px)',
      },
      fontSize: {
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['20px', '28px'],
        xl: ['24px', '32px'],
      },
      fontFamily: {
        heading: ['var(--font-comfortaa)'],
        body: ['var(--font-noto-sans)'],
      },
      transitionProperty: {
        props: 'height, width, opacity, background-color, color, border-color',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('tailwindcss-radix')()],
}
