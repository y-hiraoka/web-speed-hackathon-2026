import { Router } from "express";
import httpErrors from "http-errors";

import { Comment, Post } from "@web-speed-hackathon-2026/server/src/models";

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;

export const postRouter = Router();

postRouter.get("/posts", async (req, res) => {
  const posts = await Post.findAll({
    limit: Math.min(
      req.query["limit"] != null ? Number(req.query["limit"]) : DEFAULT_LIMIT,
      MAX_LIMIT,
    ),
    offset: req.query["offset"] != null ? Number(req.query["offset"]) : 0,
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).type("application/json").send(posts);
});

postRouter.get("/posts/:postId", async (req, res) => {
  const post = await Post.findByPk(req.params.postId);

  if (post === null) {
    throw new httpErrors.NotFound();
  }

  return res.status(200).type("application/json").send(post);
});

postRouter.get("/posts/:postId/comments", async (req, res) => {
  const posts = await Comment.findAll({
    limit: Math.min(
      req.query["limit"] != null ? Number(req.query["limit"]) : DEFAULT_LIMIT,
      MAX_LIMIT,
    ),
    offset: req.query["offset"] != null ? Number(req.query["offset"]) : 0,
    where: {
      postId: req.params.postId,
    },
  });

  return res.status(200).type("application/json").send(posts);
});

postRouter.post("/posts", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }

  const post = await Post.create(
    {
      ...req.body,
      userId: req.session.userId,
    },
    {
      include: [
        {
          association: "images",
          through: { attributes: [] },
        },
        { association: "movie" },
        { association: "sound" },
      ],
    },
  );

  // Keep FTS5 index in sync with new posts
  await Post.sequelize!.query("INSERT INTO posts_fts(id, text) VALUES (:id, :text)", {
    replacements: { id: post.id, text: post.text },
  });

  return res.status(200).type("application/json").send(post);
});
