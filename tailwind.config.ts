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
        ink: "#2C2420",
        blush: "#F5D5D0",
        sage: "#C8DDD0",
        coral: "#E8A598",
        gold: "#D4A853",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Pretendard", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
