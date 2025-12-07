import type { Config } from 'tailwindcss'

export default {
  // Use the app's theme toggle instead of the OS color preference
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
} satisfies Config
