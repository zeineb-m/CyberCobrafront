/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        error: 'var(--error)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        // convenience aliases often used in hover states
        'surface-light': 'var(--surface-light)',
      },
    },
  },
  plugins: [],
}
