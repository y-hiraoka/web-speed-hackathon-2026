import { execFile } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";

import { Router } from "express";
import { fileTypeFromBuffer } from "file-type";
import httpErrors from "http-errors";
import { v4 as uuidv4 } from "uuid";

import { UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";

const execFileAsync = promisify(execFile);

// 変換した画像の拡張子
const EXTENSION = "jpg";

export const imageRouter = Router();

async function getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-of", "json",
    filePath,
  ]);
  const { width, height } = JSON.parse(stdout).streams[0];
  return { width, height };
}

imageRouter.post("/images", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }
  if (Buffer.isBuffer(req.body) === false) {
    throw new httpErrors.BadRequest();
  }

  const type = await fileTypeFromBuffer(req.body);
  if (type === undefined || !type.mime.startsWith("image/")) {
    throw new httpErrors.BadRequest("Invalid file type");
  }

  const imageId = uuidv4();

  const outputDir = path.resolve(UPLOAD_PATH, "images");
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.resolve(outputDir, `${imageId}.${EXTENSION}`);

  if (type.ext === EXTENSION) {
    // Already JPEG, just save
    await fs.writeFile(outputPath, req.body);
  } else {
    // Convert to JPEG using ffmpeg
    const tmpInput = path.join(os.tmpdir(), `${imageId}-input.${type.ext}`);
    try {
      await fs.writeFile(tmpInput, req.body);
      await execFileAsync("ffmpeg", [
        "-i", tmpInput,
        "-y",
        "-q:v", "2",
        outputPath,
      ]);
    } finally {
      await fs.unlink(tmpInput).catch(() => {});
    }
  }

  const { width, height } = await getImageDimensions(outputPath);

  return res.status(200).type("application/json").send({ id: imageId, width, height });
});
