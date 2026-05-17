import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        background: '#0F0F0F',
        surface: '#1A1A1A',
        border: '#2A2A2A',
        'text-primary': '#F5F5F5',
        'text-muted': '#888888',
        accent: '#4F7EFF',
      },
    },
  },
  plugins: [],
}

export default config
