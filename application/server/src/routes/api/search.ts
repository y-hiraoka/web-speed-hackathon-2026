import path from "node:path";

import Bluebird from "bluebird";
import { Router } from "express";
import type { Tokenizer, IpadicFeatures } from "kuromoji";
import kuromoji from "kuromoji";
import analyze from "negaposi-analyzer-ja";
import { Op } from "sequelize";

import { Post } from "@web-speed-hackathon-2026/server/src/models";
import { parseSearchQuery } from "@web-speed-hackathon-2026/server/src/utils/parse_search_query.js";

export const searchRouter = Router();

// Singleton tokenizer - initialized lazily on first use
let tokenizerPromise: Promise<Tokenizer<IpadicFeatures>> | null = null;

function getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (!tokenizerPromise) {
    const dicPath = path.resolve("node_modules/kuromoji/dict");
    const builder = Bluebird.promisifyAll(kuromoji.builder({ dicPath })) as ReturnType<typeof kuromoji.builder> & { buildAsync: () => Promise<Tokenizer<IpadicFeatures>> };
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

  const searchTerm = keywords ? `%${keywords}%` : null;
  const limit = req.query["limit"] != null ? Number(req.query["limit"]) : undefined;
  const offset = req.query["offset"] != null ? Number(req.query["offset"]) : undefined;

  // 日付条件を構築
  const dateConditions: Record<symbol, Date>[] = [];
  if (sinceDate) {
    dateConditions.push({ [Op.gte]: sinceDate });
  }
  if (untilDate) {
    dateConditions.push({ [Op.lte]: untilDate });
  }
  const dateWhere =
    dateConditions.length > 0 ? { createdAt: Object.assign({}, ...dateConditions) } : {};

  // テキスト検索とユーザー名検索を1つのクエリに統合
  const posts = await Post.findAll({
    include: searchTerm
      ? [
          {
            association: "user",
            attributes: { exclude: ["profileImageId"] },
            include: [{ association: "profileImage" }],
            required: false,
          },
        ]
      : undefined,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    where: {
      ...dateWhere,
      ...(searchTerm
        ? {
            [Op.or]: [
              { text: { [Op.like]: searchTerm } },
              { "$user.username$": { [Op.like]: searchTerm } },
              { "$user.name$": { [Op.like]: searchTerm } },
            ],
          }
        : {}),
    },
    subQuery: false,
  });

  return res.status(200).type("application/json").send(posts);
});
