/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#0a0a0f",
          surface: "#13131a",
          card: "#1a1a27",
          border: "#2a2a3d",
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
          ai: "#10b981",
          danger: "#ef4444",
          text: "#e2e8f0",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-dot": "bounceDot 1.4s infinite ease-in-out",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: 0 }, "100%": { transform: "translateY(0)", opacity: 1 } },
        bounceDot: { "0%, 80%, 100%": { transform: "scale(0)" }, "40%": { transform: "scale(1)" } },
        glow: { "from": { boxShadow: "0 0 10px #6366f1" }, "to": { boxShadow: "0 0 25px #8b5cf6, 0 0 50px #6366f133" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
