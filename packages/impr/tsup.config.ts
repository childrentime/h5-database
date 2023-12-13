import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  clean: true,
  splitting: true,
  outDir: "dist",
  format: ["cjs", "esm"],
  shims: true,
  dts: true,
  external: ["react", "react-dom"],
});
