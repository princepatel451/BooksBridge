import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0F',
        'ink-soft': '#1A1A2E',
        gold: '#C9A84C',
        'gold-light': '#E8C76A',
        'gold-muted': '#8B6914',
        cream: '#F5F0E8',
        'cream-dark': '#EAE3D2',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        hero: 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 50%), #0A0A0F',
      }
    },
  },
  plugins: [],
}
export default config
