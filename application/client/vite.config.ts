import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const __dirname = import.meta.dirname;

export default defineConfig({
  root: path.resolve(__dirname, "src"),

  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
  ],

  build: {
    outDir: path.resolve(__dirname, "../dist"),
    emptyOutDir: true,
  },

  server: {
    port: 8080,
    host: "0.0.0.0",
    proxy: {
      "/api": "http://localhost:3000",
      "/images": "http://localhost:3000",
      "/movies": "http://localhost:3000",
      "/sounds": "http://localhost:3000",
      "/sprites": "http://localhost:3000",
    },
  },

  resolve: {
    alias: {
      "@web-speed-hackathon-2026/client": path.resolve(__dirname),
      "bayesian-bm25": path.resolve(__dirname, "node_modules/bayesian-bm25/dist/index.js"),
      kuromoji: path.resolve(__dirname, "node_modules/kuromoji/build/kuromoji.js"),
    },
  },

  define: {
    "process.env.BUILD_DATE": JSON.stringify(new Date().toISOString()),
    "process.env.COMMIT_HASH": JSON.stringify(process.env["SOURCE_VERSION"] ?? ""),
    "process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"] ?? "development"),
  },

});
