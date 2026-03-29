import fs from "node:fs";
import path from "node:path";

import { Router } from "express";

import { CLIENT_DIST_PATH } from "@web-speed-hackathon-2026/server/src/paths";
import { Post, User } from "@web-speed-hackathon-2026/server/src/models";

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

interface InitialData {
  me: object | null;
  posts?: object[];
}

// Catch-all handler for SPA routes — serves index.html with injected initial data
ssrRouter.get("*", async (req, res, next) => {
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
      const posts = await Post.findAll({ limit: 30, offset: 0 });
      initialData.posts = posts.map((p) => p.toJSON());
    }

    // Inject initial data script before </head>
    const dataScript = `<script>window.__INITIAL_DATA__=${JSON.stringify(initialData).replace(/</g, "\\u003c")}</script>`;
    const html = template.replace("</head>", `${dataScript}\n</head>`);

    res.status(200).type("text/html").send(html);
  } catch (err) {
    next(err);
  }
});
