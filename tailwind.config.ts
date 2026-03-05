import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf8ec",
          100: "#f9edcc",
          200: "#f3d98a",
          300: "#ecc04d",
          400: "#e5a924",
          500: "#c9a84c",
          600: "#a8873a",
          700: "#8a6b2e",
          800: "#6d5228",
          900: "#4a3518",
        },
        navy: {
          900: "#0b0f1a",
          800: "#0f1422",
          700: "#131928",
          600: "#1a2235",
          500: "#232d42",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #c9a84c, #a8873a)",
        "navy-gradient":
          "linear-gradient(180deg, #0b0f1a 0%, #131928 100%)",
        "hero-radial":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "fade-up": "fadeUp 0.6s ease forwards",
        "pulse-slow": "pulse 3s infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
