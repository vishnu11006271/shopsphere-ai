import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#17211d", muted: "#68756e", canvas: "#f6f7f2", brand: "#246b52", accent: "#e9a23b" }, boxShadow: { soft: "0 12px 40px rgba(25, 48, 38, .08)" } } },
  plugins: [],
};
export default config;
