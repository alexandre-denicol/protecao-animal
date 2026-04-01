import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#F5F0FF',
          100: '#EDE0FF',
          200: '#DCC8FF',
          300: '#C8A8E8',
          400: '#B088D4',
          500: '#9868C0',
          600: '#7A4EA0',
          700: '#5C3880',
          800: '#3E2460',
          900: '#201040',
        },
        amber: {
          300: '#F5C878',
          400: '#F0A850',
          500: '#E8934A',
          600: '#D07830',
          700: '#B05820',
        },
        salmon: {
          300: '#F8A898',
          400: '#F48878',
          500: '#F07850',
          600: '#D05838',
        },
        neutral: {
          50:  '#FAFAF8',
          100: '#F5F4F0',
          200: '#E8E6E0',
          300: '#D0CEC8',
          400: '#A8A49C',
          500: '#807C74',
          600: '#58544C',
          700: '#383430',
          800: '#201E1A',
          900: '#100E0C',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        xs:    ['12px', { lineHeight: '1.5' }],
        sm:    ['14px', { lineHeight: '1.5' }],
        base:  ['16px', { lineHeight: '1.5' }],
        lg:    ['18px', { lineHeight: '1.5' }],
        xl:    ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
      },
    },
  },
  plugins: [],
}

export default config
