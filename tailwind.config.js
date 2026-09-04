/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tni: {
          dark: "#0B1611",
          darker: "#070E0B",
          surface: "#10221B",
          border: "#1D3B2F",
          ad: {
            DEFAULT: "#1B5E39",
            dark: "#0F3B23",
            light: "#2B8754"
          },
          al: {
            DEFAULT: "#153E75",
            dark: "#0C274C",
            light: "#2058A3"
          },
          au: {
            DEFAULT: "#1B6B93",
            dark: "#10435C",
            light: "#288FC4"
          },
          gold: {
            300: "#F5E296",
            400: "#E9CD64",
            500: "#D4AF37",
            600: "#B99427",
            700: "#917319"
          },
          crimson: {
            DEFAULT: "#9B111E",
            dark: "#700B15"
          }
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"]
      },
      backgroundImage: {
        'military-gradient': 'linear-gradient(135deg, #070E0B 0%, #10221B 50%, #0B1611 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F5E296 0%, #D4AF37 50%, #917319 100%)',
        'ad-gradient': 'linear-gradient(135deg, #1B5E39 0%, #0F3B23 100%)',
        'al-gradient': 'linear-gradient(135deg, #153E75 0%, #0C274C 100%)',
        'au-gradient': 'linear-gradient(135deg, #1B6B93 0%, #10435C 100%)',
      }
    },
  },
  plugins: [],
};

