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
        background: "#f8fafc",
        surface: "#ffffff",
        primary: {
          DEFAULT: "#1E40AF", // Deep government navy blue
          hover: "#1e3a8a",
          light: "#eff6ff",
        },
        dark: "#0F172A", // Dark Slate 900
        accent: "#2563EB", // Accent Blue 600
        success: "#16A34A", // Success Green 600
        neutral: "#64748B", // Neutral Slate 500
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        }
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "SF Mono", "Menlo", "Consolas", "monospace"]
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "16px",
        '2xl': "16px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)",
      }
    },
  },
  plugins: [],
};
