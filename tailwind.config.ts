// UI-001: Tailwind configuration mapping Verdant Earth CSS variables and 44px touch targets
import type { Config } from 'tailwindcss';

const touchTargetPlugin = ({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) => {
  addUtilities({
    '.touch-target': {
      'min-height': '44px',
      'min-width': '44px',
      'display': 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
    },
    '.touch-target-row': {
      'min-height': '44px',
    },
  });
};

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './apps/web/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          soft: 'var(--color-primary-soft)',
        },
        bg: {
          DEFAULT: 'var(--color-bg)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [touchTargetPlugin],
};

export default config;
