import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      lineHeight: {
        'extra-loose': '2.5',
        '12': '4rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
} satisfies Config;
