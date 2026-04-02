import path from "node:path";

import Bluebird from "bluebird";
import { Router } from "express";
import type { Tokenizer, IpadicFeatures } from "kuromoji";
import kuromoji from "kuromoji";
import analyze from "negaposi-analyzer-ja";
import { Op, QueryTypes } from "sequelize";

import { Post } from "@web-speed-hackathon-2026/server/src/models";
import { parseSearchQuery } from "@web-speed-hackathon-2026/server/src/utils/parse_search_query.js";

export const searchRouter = Router();

// Singleton tokenizer - initialized lazily on first use
let tokenizerPromise: Promise<Tokenizer<IpadicFeatures>> | null = null;

function getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (!tokenizerPromise) {
    const dicPath = path.resolve("node_modules/kuromoji/dict");
    const builder = Bluebird.promisifyAll(kuromoji.builder({ dicPath })) as ReturnType<
      typeof kuromoji.builder
    > & { buildAsync: () => Promise<Tokenizer<IpadicFeatures>> };
    tokenizerPromise = builder.buildAsync();
  }
  return tokenizerPromise;
}

searchRouter.get("/search/sentiment", async (req, res) => {
  const text = req.query["text"];

  if (typeof text !== "string" || text.trim() === "") {
    return res.status(200).json({ score: 0, label: "neutral" });
  }

  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(text);
  const score = analyze(tokens);

  let label: "positive" | "negative" | "neutral";
  if (score > 0.1) {
    label = "positive";
  } else if (score < -0.1) {
    label = "negative";
  } else {
    label = "neutral";
  }

  return res.status(200).json({ score, label });
});

/**
 * Escape special FTS5 characters in a search term.
 * Wraps the term in double-quotes so that punctuation and operators are treated as literals.
 */
function fts5Escape(term: string): string {
  // Double-quote escaping: replace " with "" inside, then wrap in quotes
  return '"' + term.replace(/"/g, '""') + '"';
}

searchRouter.get("/search", async (req, res) => {
  const query = req.query["q"];

  if (typeof query !== "string" || query.trim() === "") {
    return res.status(200).type("application/json").send([]);
  }

  const { keywords, sinceDate, untilDate } = parseSearchQuery(query);

  // キーワードも日付フィルターもない場合は空配列を返す
  if (!keywords && !sinceDate && !untilDate) {
    return res.status(200).type("application/json").send([]);
  }

  const limit = req.query["limit"] != null ? Number(req.query["limit"]) : undefined;
  const offset = req.query["offset"] != null ? Number(req.query["offset"]) : undefined;

  // Build a single raw SQL query that uses FTS5 for keyword matching
  // and combines text search + user name search via UNION
  const whereClauses: string[] = [];
  const replacements: Record<string, string | number> = {};

  if (sinceDate) {
    whereClauses.push("p.createdAt >= :sinceDate");
    replacements["sinceDate"] = sinceDate.toISOString();
  }
  if (untilDate) {
    whereClauses.push("p.createdAt <= :untilDate");
    replacements["untilDate"] = untilDate.toISOString();
  }

  const dateFilter = whereClauses.length > 0 ? " AND " + whereClauses.join(" AND ") : "";

  let idQuery: string;

  if (keywords) {
    // FTS5 trigram tokenizer requires at least 3 characters for MATCH
    const useFts = keywords.length >= 3;

    if (useFts) {
      const escapedTerm = fts5Escape(keywords);
      replacements["ftsKeyword"] = escapedTerm;

      // Use FTS5 MATCH for both post text and user name/username searches
      // Combine via UNION to get distinct post IDs in a single query
      idQuery = `
        SELECT p.id FROM Posts p
          INNER JOIN posts_fts pf ON pf.id = p.id
          WHERE pf.text MATCH :ftsKeyword${dateFilter}
        UNION
        SELECT p.id FROM Posts p
          INNER JOIN users_fts uf ON uf.id = p.userId
          WHERE (uf.username MATCH :ftsKeyword OR uf.name MATCH :ftsKeyword)${dateFilter}
      `;
    } else {
      // Short keywords: fall back to LIKE (rare case, small perf impact)
      replacements["likeTerm"] = `%${keywords}%`;
      idQuery = `
        SELECT p.id FROM Posts p
          WHERE p.text LIKE :likeTerm${dateFilter}
        UNION
        SELECT p.id FROM Posts p
          INNER JOIN Users u ON u.id = p.userId
          WHERE (u.username LIKE :likeTerm OR u.name LIKE :likeTerm)${dateFilter}
      `;
    }
  } else {
    // Date-only filter
    idQuery = `SELECT p.id FROM Posts p WHERE 1=1${dateFilter}`;
  }

  // Add ordering and pagination at the SQL level
  const fullQuery = `
    SELECT sub.id FROM (${idQuery}) sub
    INNER JOIN Posts p2 ON p2.id = sub.id
    ORDER BY p2.createdAt DESC
    ${limit != null ? "LIMIT :limit" : ""}
    ${offset != null ? "OFFSET :offset" : ""}
  `;

  if (limit != null) replacements["limit"] = limit;
  if (offset != null) replacements["offset"] = offset;

  const sequelize = Post.sequelize!;
  const rows = (await sequelize.query(fullQuery, {
    replacements,
    type: QueryTypes.SELECT,
  })) as { id: string }[];

  if (rows.length === 0) {
    return res.status(200).type("application/json").send([]);
  }

  const postIds = rows.map((r) => r.id);

  // Fetch full Post objects with associations using Sequelize default scope
  const result = await Post.findAll({
    where: { id: { [Op.in]: postIds } },
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).type("application/json").send(result);
});
