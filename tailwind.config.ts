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
        cream: "#FDFBF7",
        sand: "#F5F1E9",
        ink: "#3D2A4A",
        plum: "#5C3D6E",
        primary: "#442656",
        secondary: "#715A4C",
        surface: "#FBF9F5",
        "surface-container": "#EFEEEA",
        "surface-container-low": "#F5F3EF",
        "surface-container-high": "#EAE8E4",
        "on-surface": "#1B1C1A",
        "on-surface-variant": "#4B444D",
        outline: "#7D747E",
        blush: "#FDECE7",
        sage: "#B8E6D8",
        mint: "#E1F5F0",
        coral: "#E8A598",
        gold: "#FFD966",
        lavender: "#E6E1F9",
        petal: "#FCE1F1",
        sky: "#C8E8F8",
        "channel-dog": "#3B82F6",
        "channel-cat": "#EF4444",
        "channel-saju": "#8B5CF6",
        "channel-community": "#22C55E",
        "mok-green": "#4A9B6E",
        "hwa-red": "#C75C5C",
        "to-yellow": "#C9956A",
        "geum-silver": "#9A9488",
        "su-blue": "#3E6B8A",
        "element-wood": "#E5F4EC",
        "element-fire": "#FCEAE7",
        "element-earth": "#F7F0E4",
        "element-metal": "#F2F0ED",
        "element-water": "#E6EFF6",
        "night-sky": "var(--night-sky-base)",
      },
      fontFamily: {
        sans: ["SUIT Variable", "SUIT", "var(--font-noto)", "Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundImage: {
        "dream-sky":
          "radial-gradient(ellipse 90% 60% at 10% 5%, rgba(252,225,241,0.65) 0%, transparent 55%), radial-gradient(ellipse 90% 60% at 90% 10%, rgba(225,245,240,0.75) 0%, transparent 55%), linear-gradient(135deg, #FDFBF7 0%, #E6E1F9 52%, #E1F5F0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
