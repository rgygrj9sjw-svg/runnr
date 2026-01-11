/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        runnr: {
          dark: '#0a0a0f',
          darker: '#06060a',
          card: '#12121a',
          border: '#1e1e2e',
          hover: '#1a1a2a',
        },
        bull: '#22c55e',
        bear: '#ef4444',
        accent: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
