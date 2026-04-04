import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Router } from "express";
import httpErrors from "http-errors";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { QaSuggestion } from "@web-speed-hackathon-2026/server/src/models";
import {
  extractTokens,
  filterSuggestionsBM25,
} from "@web-speed-hackathon-2026/server/src/utils/bm25_search";
import { getTokenizer } from "@web-speed-hackathon-2026/server/src/utils/kuromoji_tokenizer";

export const crokRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownSource = fs.readFileSync(path.join(__dirname, "crok-response.md"), "utf-8");

const response = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeHighlight, { detect: false })
  .use(rehypeStringify)
  .processSync(markdownSource)
  .toString();

crokRouter.get("/crok/suggestions/search", async (req, res) => {
  const q = req.query["q"];

  if (typeof q !== "string" || q.trim() === "") {
    return res.json({ suggestions: [], queryTokens: [] });
  }

  const tokenizer = await getTokenizer();
  const suggestions = await QaSuggestion.findAll({ logging: false });
  const candidates = suggestions.map((s) => s.question);

  const queryTokens = extractTokens(tokenizer.tokenize(q));
  const results = filterSuggestionsBM25(tokenizer, candidates, queryTokens);

  return res.json({ suggestions: results, queryTokens });
});

crokRouter.get("/crok/suggestions", async (_req, res) => {
  const suggestions = await QaSuggestion.findAll({ logging: false });
  res.json({ suggestions: suggestions.map((s) => s.question) });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

crokRouter.get("/crok", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let messageId = 0;

  // TTFT (Time to First Token)
  await sleep(3000);

  const chunkSize = Math.ceil(response.length / markdownSource.length);

  for (let i = 0; i < response.length; i += chunkSize) {
    if (res.closed) break;

    const chunk = response.slice(i, i + chunkSize);
    const data = JSON.stringify({ text: chunk, done: false });
    res.write(`event: message\nid: ${messageId++}\ndata: ${data}\n\n`);

    await sleep(10);
  }

  if (!res.closed) {
    const data = JSON.stringify({ text: "", done: true });
    res.write(`event: message\nid: ${messageId}\ndata: ${data}\n\n`);
  }

  res.end();
});
