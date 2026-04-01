import { promises as fs } from "fs";
import path from "path";

import ExifReader from "exifreader";
import { Router } from "express";
import httpErrors from "http-errors";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

import { Image } from "@web-speed-hackathon-2026/server/src/models";
import { UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";

const EXTENSION = "webp";

export const imageRouter = Router();

imageRouter.post("/images", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }
  if (Buffer.isBuffer(req.body) === false) {
    throw new httpErrors.BadRequest();
  }

  // EXIF description を元画像から抽出
  let alt = "";
  try {
    const tags = ExifReader.load(req.body);
    const desc = tags["ImageDescription"];
    if (desc?.description) {
      alt = desc.description;
    }
  } catch {
    // no EXIF
  }

  // sharp で WebP に変換・リサイズし、サイズを取得
  const webpBuffer = await sharp(req.body)
    .resize({ width: 1280, height: 1280, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const metadata = await sharp(webpBuffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const imageId = uuidv4();

  const filePath = path.resolve(UPLOAD_PATH, `./images/${imageId}.${EXTENSION}`);
  await fs.mkdir(path.resolve(UPLOAD_PATH, "images"), { recursive: true });
  await fs.writeFile(filePath, webpBuffer);

  const image = await Image.create({ id: imageId, alt, width, height });

  return res.status(200).type("application/json").send(image);
});
