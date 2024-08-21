import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        goods: {
          "50": "#f5faf3",
          "100": "#e6f5e3",
          "200": "#cdeac8",
          "300": "#a6d89d",
          "400": "#77bd6b",
          "500": "#53a146",
          "600": "#408435",
          "700": "#35682d",
          "800": "#2f5729",
          "900": "#264522",
          "950": "#10250e",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
