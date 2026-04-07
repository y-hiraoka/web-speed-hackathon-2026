import fs from "node:fs";
import path from "node:path";

import { Router } from "express";
import serveStatic from "serve-static";

import {
  CLIENT_DIST_PATH,
  PUBLIC_PATH,
  UPLOAD_PATH,
} from "@web-speed-hackathon-2026/server/src/paths";
import { collectPageData } from "@web-speed-hackathon-2026/server/src/routes/collect_page_data";

const templateHtml = fs.readFileSync(path.join(CLIENT_DIST_PATH, "index.html"), "utf-8");

export const staticRouter = Router();

staticRouter.use(serveStatic(UPLOAD_PATH));

staticRouter.use(serveStatic(PUBLIC_PATH));

staticRouter.use(
  "/assets",
  serveStatic(`${CLIENT_DIST_PATH}/assets`, {
    maxAge: "1y",
    immutable: true,
  }),
);

// SPA フォールバック: データインジェクション付き HTML を返す
staticRouter.get("*path", async (req, res) => {
  try {
    const fallback = await collectPageData(req.path, req.query as Record<string, unknown>, req.session.userId);
    const serialized = JSON.stringify(fallback).replace(/</g, "\\u003c");
    const html = templateHtml.replace(
      "<!--SSR_DATA-->",
      `<script>window._INITIAL_DATA=${serialized}</script>`,
    );
    res.status(200).type("html").send(html);
  } catch {
    // データ収集に失敗しても HTML は返す（フォールバック）
    res.status(200).type("html").send(templateHtml);
  }
});
