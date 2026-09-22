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
        background: "var(--bg-main, #F5F6F8)",
        surface: "var(--surface, #ffffff)",
        primary: {
          DEFAULT: "#1E40AF", // Deep government navy blue
          hover: "#1e3a8a",
          light: "#eff6ff",
          DEFAULT: "var(--primary, #8B0000)", // Primary Red PUSINFOLAHTA
          hover: "var(--primary-dark, #6B0000)",
          light: "#FDF2F2",
        },
        dark: "#0F172A", // Dark Slate 900
        accent: "#2563EB", // Accent Blue 600
        success: "#16A34A", // Success Green 600
        warning: "#F59E0B", // Warning Amber 500
        neutral: "#64748B", // Neutral Slate 500
        tni: {
          red: "#8B0000",
          darkred: "#6B0000",
          gold: "#B8860B",
          goldlight: "#D4AF37",
          brown: "#9B6A35",
          brownhark: "#7B532A",
          bg: "#F5F6F8",
          card: "#FFFFFF",
          border: "#E5E7EB",
          text: "#1F2937",
          muted: "#6B7280",
        },
        dark: "#1F2937",
        accent: "var(--accent, #B8860B)",
        success: "#16A34A",
        warning: "#F59E0B",
        neutral: "#6B7280",
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
        sans: ["var(--font-ibm-plex-sans)", "'IBM Plex Sans'", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "SF Mono", "Menlo", "Consolas", "monospace"]
      },
      borderRadius: {
        sm: "8px",
        sm: "6px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "16px",
        md: "10px",
        lg: "12px",
        xl: "14px",
        '2xl': "16px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 4px 12px -2px rgba(15, 23, 42, 0.10)",
        command: "0 10px 25px -5px rgba(107, 0, 0, 0.25), 0 8px 10px -6px rgba(107, 0, 0, 0.2)"
      }
    },
  },
  plugins: [],
};
