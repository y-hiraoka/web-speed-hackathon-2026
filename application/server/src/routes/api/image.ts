import { promises as fs } from "fs";
import path from "path";

import { Router } from "express";
import httpErrors from "http-errors";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

import { UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";

export const imageRouter = Router();

imageRouter.post("/images", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }
  if (Buffer.isBuffer(req.body) === false) {
    throw new httpErrors.BadRequest();
  }

  const imageId = uuidv4();
  const ext = "webp";

  const outputDir = path.resolve(UPLOAD_PATH, "images");
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.resolve(outputDir, `${imageId}.${ext}`);

  const image = sharp(req.body);
  const metadata = await image.metadata();

  await image.webp({ quality: 80 }).toFile(outputPath);

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  return res.status(200).type("application/json").send({ id: imageId, ext, width, height });
});
