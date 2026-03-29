import { Router } from "express";
import { Op } from "sequelize";

import { Post } from "@web-speed-hackathon-2026/server/src/models";
import { parseSearchQuery } from "@web-speed-hackathon-2026/server/src/utils/parse_search_query.js";

export const searchRouter = Router();

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
