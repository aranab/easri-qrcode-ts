import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: "esbuild",
    lib: {
      entry: resolve(__dirname, "src/QRCode/index.ts"),
      name: "AsriQRCode",
      formats: ["iife", "cjs", "umd", "es"],
      fileName: "asriQRCode@v1.0.0",
    },
  },
});