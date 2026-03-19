/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef7f0',
          100: '#fdecd8',
          200: '#fad5b0',
          300: '#f6b87e',
          400: '#f1944a',
          500: '#ed7420',
          600: '#de5b12',
          700: '#b84311',
          800: '#933616',
          900: '#7a2e15',
          950: '#42150a',
        },
        secondary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#1e1b4b',
          600: '#171540',
          700: '#110f35',
          800: '#0b0a2a',
          900: '#06061f',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a017',
          600: '#b8860b',
          700: '#92400e',
        },
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: '#eab308',
        danger: '#ef4444',
        warm: {
          50:  '#faf8f5',
          100: '#f5f1eb',
          200: '#ebe5db',
          300: '#d6cdc0',
          400: '#b8a994',
          500: '#9a8b78',
          600: '#7d6e5d',
          700: '#66594b',
          800: '#554a3f',
          900: '#493f37',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-express': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'ticker': 'ticker 20s linear infinite',
        'pulse-express': 'pulse-express 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
