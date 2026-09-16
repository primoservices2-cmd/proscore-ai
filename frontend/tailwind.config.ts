import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        dark: { 900: '#020617', 800: '#0f172a', 700: '#1e293b' },
        neon: { green: '#39FF14', blue: '#00D4FF' }
      }
    }
  },
  plugins: []
};
export default config;
