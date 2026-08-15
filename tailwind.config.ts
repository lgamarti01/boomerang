import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0B1526",
          900: "#0F1D33",
          800: "#152B49",
          700: "#1D3A61",
        },
        paper: "#F5F6F8",
        ink: "#101826",
        steel: {
          DEFAULT: "#5B6B82",
          light: "#8B98AB",
        },
        amber: {
          DEFAULT: "#F5A623",
          ink: "#7A4E00",
        },
        teal: {
          DEFAULT: "#1E8E6B",
          bg: "#E7F4EF",
        },
        alert: {
          DEFAULT: "#D64545",
          bg: "#FBEAEA",
        },
        line: "#E2E6EC",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
