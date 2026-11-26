import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

// const eslintConfig = [
//   // Next.js generates this file; its triple-slash references are required by TypeScript.
//   { ignores: ["next-env.d.ts"] },
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];
const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
