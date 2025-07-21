import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  splitting: false,
  format: ["cjs", "esm"],
  target: "es2019",
  sourcemap: true,
  clean: true,
  outDir: "dist",
});
