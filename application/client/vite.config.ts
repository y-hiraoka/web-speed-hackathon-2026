import path from "node:path";

import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig } from "vite";

const DIST_PATH = path.resolve(__dirname, "../dist");

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, "node_modules/katex/dist/fonts/*"),
          dest: "styles/fonts",
        },
      ],
    }),
  ],
  build: {
    outDir: DIST_PATH,
    emptyOutDir: true,
    target: "esnext",
  },
  resolve: {
    alias: [
      {
        find: "@web-speed-hackathon-2026/client",
        replacement: __dirname,
      },
      {
        find: /^bayesian-bm25$/,
        replacement: path.resolve(__dirname, "node_modules/bayesian-bm25/dist/index.js"),
      },
      {
        find: /^kuromoji$/,
        replacement: path.resolve(__dirname, "node_modules/kuromoji/build/kuromoji.js"),
      },
    ],
  },
  define: {
    "process.env.BUILD_DATE": JSON.stringify(new Date().toISOString()),
    "process.env.COMMIT_HASH": JSON.stringify(process.env["SOURCE_VERSION"] || ""),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  server: {
    port: 8080,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
