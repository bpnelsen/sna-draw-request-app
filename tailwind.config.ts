import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sna-navy': '#0F3A7D',
        'sna-teal': '#06B6D4',
      },
    },
  },
  plugins: [],
}
export default config
