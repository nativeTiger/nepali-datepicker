import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  // Keep React and Radix as peer deps — never bundle them
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "nepali-date-converter",
    "lucide-react",
    /^@radix-ui\/.*/,
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
