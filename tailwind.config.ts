import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        foreground: "#1A1A1A",
        primary: {
          DEFAULT: "#0E2115",
          btn: "#092213",
          dark: "#050B07",
        },
        accent: {
          DEFAULT: "#BD9655",
          hover: "#A88345",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F3F4F6",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 20px 40px -10px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
