import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { Router } from "express";

import { Post, User } from "@web-speed-hackathon-2026/server/src/models";
import { CLIENT_DIST_PATH } from "@web-speed-hackathon-2026/server/src/paths";

export const ssrRouter = Router();

// Cache the built index.html template in memory
let htmlTemplate: string | null = null;

function getHtmlTemplate(): string {
  if (htmlTemplate == null) {
    const htmlPath = path.join(CLIENT_DIST_PATH, "index.html");
    htmlTemplate = fs.readFileSync(htmlPath, "utf-8");
  }
  return htmlTemplate;
}

// Lazily load the SSR render function from the Vite SSR build
let renderFn: ((url: string, initialData?: object) => string) | null | false = null;

async function getRenderFn(): Promise<((url: string, initialData?: object) => string) | null> {
  if (renderFn === false) return null; // previously failed to load
  if (renderFn != null) return renderFn;

  // Try .mjs first (Vite default for SSR builds), then .js
  let ssrEntryPath = path.join(CLIENT_DIST_PATH, "server", "entry-server.mjs");
  if (!fs.existsSync(ssrEntryPath)) {
    ssrEntryPath = path.join(CLIENT_DIST_PATH, "server", "entry-server.js");
  }
  if (!fs.existsSync(ssrEntryPath)) {
    console.warn("[SSR] SSR bundle not found - falling back to client-only rendering");
    renderFn = false;
    return null;
  }

  try {
    const mod = await import(pathToFileURL(ssrEntryPath).href);
    renderFn = mod.render;
    return renderFn as (url: string, initialData?: object) => string;
  } catch (err) {
    console.warn("[SSR] Failed to load SSR bundle:", err);
    renderFn = false;
    return null;
  }
}

interface InitialData {
  me: object | null;
  posts?: object[];
}

// Catch-all handler for SPA routes — serves index.html with injected initial data
ssrRouter.get("/{*splat}", async (req, res, next) => {
  // Skip API routes and static assets
  const url = req.path;
  if (
    url.startsWith("/api/") ||
    url.startsWith("/fonts/") ||
    url.startsWith("/sprites/") ||
    url.startsWith("/upload/") ||
    url.startsWith("/assets/") ||
    url.includes(".")
  ) {
    return next();
  }

  try {
    const template = getHtmlTemplate();

    // Fetch the active user from session
    const initialData: InitialData = { me: null };
    if (req.session.userId != null) {
      const user = await User.findByPk(req.session.userId);
      if (user != null) {
        initialData.me = user.toJSON();
      }
    }

    // For the homepage, prefetch posts
    if (url === "/") {
      const posts = await Post.findAll({ limit: 30, offset: 0, order: [["createdAt", "DESC"]] });
      initialData.posts = posts.map((p) => p.toJSON());
    }

    // Inject initial data script before </head>
    const dataScript = `<script>window.__INITIAL_DATA__=${JSON.stringify(initialData).replace(/</g, "\\u003c")}</script>`;
    let html = template.replace("</head>", `${dataScript}\n</head>`);

    // Server-side render the React app if SSR bundle is available
    const render = await getRenderFn();
    if (render != null) {
      try {
        const appHtml = render(url, initialData);
        html = html.replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);
      } catch (err) {
        console.warn("[SSR] Render error for", url, err);
        // Fall back to client-only rendering
      }
    }

    res.status(200).type("text/html").send(html);
  } catch (err) {
    next(err);
  }
});
