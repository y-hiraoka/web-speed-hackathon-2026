import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BM25 } from "bayesian-bm25";
import Bluebird from "bluebird";
import { Router } from "express";
import httpErrors from "http-errors";
import type { Tokenizer, IpadicFeatures } from "kuromoji";
import kuromoji from "kuromoji";

import { QaSuggestion } from "@web-speed-hackathon-2026/server/src/models";

export const crokRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const response = fs.readFileSync(path.join(__dirname, "crok-response.md"), "utf-8");

const STOP_POS = new Set(["助詞", "助動詞", "記号"]);

// Singleton tokenizer - initialized lazily on first use
let tokenizerPromise: Promise<Tokenizer<IpadicFeatures>> | null = null;

function getCrokTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (!tokenizerPromise) {
    const dicPath = path.resolve("node_modules/kuromoji/dict");
    const builder = Bluebird.promisifyAll(kuromoji.builder({ dicPath })) as ReturnType<typeof kuromoji.builder> & { buildAsync: () => Promise<Tokenizer<IpadicFeatures>> };
    tokenizerPromise = builder.buildAsync();
  }
  return tokenizerPromise;
}

function extractTokens(tokens: IpadicFeatures[]): string[] {
  return tokens
    .filter((t) => t.surface_form !== "" && t.pos !== "" && !STOP_POS.has(t.pos))
    .map((t) => t.surface_form.toLowerCase());
}

function filterSuggestionsBM25(
  tokenizer: Tokenizer<IpadicFeatures>,
  candidates: string[],
  queryTokens: string[],
): string[] {
  if (queryTokens.length === 0) return [];

  const bm25 = new BM25({ k1: 1.2, b: 0.75 });

  const tokenizedCandidates = candidates.map((c) => extractTokens(tokenizer.tokenize(c)));
  bm25.index(tokenizedCandidates);

  const scores = bm25.getScores(queryTokens) as number[];
  const results = candidates.map((text, i) => ({ text, score: scores[i]! }));

  return results
    .filter((s) => s.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(-10)
    .map((s) => s.text);
}

crokRouter.get("/crok/suggestions", async (req, res) => {
  const query = req.query["q"];
  const suggestions = await QaSuggestion.findAll({ logging: false });
  const candidates = suggestions.map((s) => s.question);

  // If query is provided, filter suggestions server-side using BM25
  if (typeof query === "string" && query.trim() !== "") {
    const tokenizer = await getCrokTokenizer();
    const queryTokens = extractTokens(tokenizer.tokenize(query));
    const filtered = filterSuggestionsBM25(tokenizer, candidates, queryTokens);
    return res.json({ suggestions: filtered, queryTokens });
  }

  return res.json({ suggestions: candidates });
});

crokRouter.get("/crok", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let messageId = 0;

  for (const char of response) {
    if (res.closed) break;

    const data = JSON.stringify({ text: char, done: false });
    res.write(`event: message\nid: ${messageId++}\ndata: ${data}\n\n`);
  }

  if (!res.closed) {
    const data = JSON.stringify({ text: "", done: true });
    res.write(`event: message\nid: ${messageId}\ndata: ${data}\n\n`);
  }

  res.end();
});
