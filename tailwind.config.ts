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
        cream: "#FBF7F2",
        sand: "#F3EBE0",
        ink: "#3D2A4A",
        plum: "#5C3D6E",
        blush: "#F5D5D0",
        sage: "#B8E6D8",
        mint: "#A8E6CF",
        coral: "#E8A598",
        gold: "#FFD966",
        lavender: "#E8D4F8",
        petal: "#F8C8E8",
        sky: "#C8E8F8",
        "channel-dog": "#3B82F6",
        "channel-cat": "#EF4444",
        "channel-saju": "#8B5CF6",
        "channel-community": "#22C55E",
      },
      fontFamily: {
        sans: ["var(--font-noto)", "Pretendard", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundImage: {
        "dream-sky":
          "radial-gradient(ellipse 120% 80% at 50% 0%, #F8E8FF 0%, transparent 55%), radial-gradient(ellipse 90% 60% at 20% 30%, #FFE8F4 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 80% 25%, #E8F4FF 0%, transparent 45%), radial-gradient(ellipse 70% 40% at 60% 70%, #FFF8E0 0%, transparent 40%), linear-gradient(180deg, #EDE4FF 0%, #F8E4F0 35%, #E8F0FF 70%, #FFFFFF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
