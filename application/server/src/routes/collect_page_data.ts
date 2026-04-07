import { Op } from "sequelize";

import { Comment, Post, User } from "@web-speed-hackathon-2026/server/src/models";
import { parseSearchQuery } from "@web-speed-hackathon-2026/server/src/utils/parse_search_query.js";

export async function collectPageData(
  path: string,
  query: Record<string, unknown>,
  userId: string | undefined,
): Promise<Record<string, unknown>> {
  const fallback: Record<string, unknown> = {};

  // 全ルート共通: /api/v1/me
  if (userId != null) {
    const user = await User.findByPk(userId);
    fallback["/api/v1/me"] = user?.toJSON() ?? null;
  } else {
    fallback["/api/v1/me"] = null;
  }

  // / (タイムライン)
  if (path === "/") {
    const posts = await Post.findAll({ limit: 20, offset: 0 });
    fallback["/api/v1/posts?limit=20&offset=0"] = posts.map((post) => post.toJSON());
  }

  // /posts/:postId
  const postMatch = path.match(/^\/posts\/([^/]+)$/);
  if (postMatch) {
    const postId = postMatch[1]!;
    const post = await Post.findByPk(postId);
    if (post != null) {
      fallback[`/api/v1/posts/${postId}`] = post.toJSON();
    }
    const comments = await Comment.findAll({
      where: { postId },
      limit: 30,
      offset: 0,
    });
    fallback[`/api/v1/posts/${postId}/comments?limit=30&offset=0`] = comments.map((comment) =>
      comment.toJSON(),
    );
  }

  // /users/:username
  const userMatch = path.match(/^\/users\/([^/]+)$/);
  if (userMatch) {
    const username = userMatch[1]!;
    const user = await User.findOne({ where: { username } });
    if (user != null) {
      fallback[`/api/v1/users/${username}`] = user.toJSON();
      const posts = await Post.findAll({
        where: { userId: user.id },
        limit: 12,
        offset: 0,
      });
      fallback[`/api/v1/users/${username}/posts?limit=12&offset=0`] = posts.map((post) =>
        post.toJSON(),
      );
    }
  }

  // /search?q=...
  if (path === "/search") {
    const queryString = typeof query["q"] === "string" ? query["q"] : "";
    if (queryString.trim() !== "") {
      const { keywords, sinceDate, untilDate } = parseSearchQuery(queryString);

      if (keywords || sinceDate || untilDate) {
        const searchTerm = keywords ? `%${keywords}%` : null;

        const dateConditions: Record<symbol, Date>[] = [];
        if (sinceDate) {
          dateConditions.push({ [Op.gte]: sinceDate });
        }
        if (untilDate) {
          dateConditions.push({ [Op.lte]: untilDate });
        }
        const dateWhere =
          dateConditions.length > 0 ? { createdAt: Object.assign({}, ...dateConditions) } : {};

        const textWhere = searchTerm ? { text: { [Op.like]: searchTerm } } : {};

        const postsByText = await Post.findAll({
          where: { ...textWhere, ...dateWhere },
        });

        let postsByUser: typeof postsByText = [];
        if (searchTerm) {
          postsByUser = await Post.findAll({
            include: [
              {
                association: "user",
                attributes: { exclude: ["profileImageId"] },
                include: [{ association: "profileImage" }],
                required: true,
                where: {
                  [Op.or]: [
                    { username: { [Op.like]: searchTerm } },
                    { name: { [Op.like]: searchTerm } },
                  ],
                },
              },
              {
                association: "images",
                through: { attributes: [] },
              },
              { association: "movie" },
              { association: "sound" },
            ],
            where: dateWhere,
          });
        }

        const postIdSet = new Set<string>();
        const mergedPosts: typeof postsByText = [];
        for (const post of [...postsByText, ...postsByUser]) {
          if (!postIdSet.has(post.id)) {
            postIdSet.add(post.id);
            mergedPosts.push(post);
          }
        }
        mergedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const result = mergedPosts.slice(0, 30);

        const encodedQuery = encodeURIComponent(queryString);
        fallback[`/api/v1/search?q=${encodedQuery}&limit=30&offset=0`] = result.map((post) =>
          post.toJSON(),
        );
      }
    }
  }

  return fallback;
}
