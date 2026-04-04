import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";

const DIST_PATH = path.resolve(__dirname, "../dist");

const buildInfoPlugin = (): import("vite").Plugin => {
  const buildDate = JSON.stringify(new Date().toISOString());
  const commitHash = JSON.stringify(process.env["SOURCE_VERSION"] || "");
  return {
    name: "inject-build-info",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          children: `window.__BUILD_INFO__={BUILD_DATE:${buildDate},COMMIT_HASH:${commitHash}};`,
          injectTo: "head-prepend",
        },
      ];
    },
  };
};

export default defineConfig({
  root: __dirname,
  plugins: [
    buildInfoPlugin(),
    react(),
    compression({ algorithm: "gzip", exclude: [/\.(br|gz)$/] }),
    compression({ algorithm: "brotliCompress", exclude: [/\.(br|gz)$/] }),
  ],
  build: {
    outDir: DIST_PATH,
    emptyOutDir: true,
    target: "esnext",
    cssMinify: "lightningcss",
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        // Don't preload heavy chunks that are only needed for Crok AI chat
        return deps.filter(
          (dep) => !dep.includes("vendor-markdown") && !dep.includes("vendor-katex"),
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("/react-markdown/") ||
              id.includes("/remark-gfm/") ||
              id.includes("/remark-math/") ||
              id.includes("/rehype-katex/") ||
              id.includes("/react-syntax-highlighter/") ||
              id.includes("/refractor/") ||
              id.includes("/highlight.js/")
            ) {
              return "vendor-markdown";
            }
            if (id.includes("/katex/")) {
              return "vendor-katex";
            }
          }
        },
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "@web-speed-hackathon-2026/client",
        replacement: __dirname,
      },
    ],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  server: {
    port: 8080,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
