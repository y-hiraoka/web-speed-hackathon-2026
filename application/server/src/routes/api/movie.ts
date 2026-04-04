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

// 変換した動画の拡張子
const EXTENSION = "mp4";

export const movieRouter = Router();

movieRouter.post("/movies", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }
  if (Buffer.isBuffer(req.body) === false) {
    throw new httpErrors.BadRequest();
  }

  // Only pass the first 4100 bytes (file-type's minimum) to avoid copying the entire buffer
  const headerSlice = (req.body as Buffer).subarray(0, 4100);
  const type = await fileTypeFromBuffer(headerSlice);
  if (type === undefined || !type.mime.startsWith("video/")) {
    throw new httpErrors.BadRequest("Invalid file type");
  }

  const movieId = uuidv4();

  const outputDir = path.resolve(UPLOAD_PATH, "movies");
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.resolve(outputDir, `${movieId}.${EXTENSION}`);

  // Convert to MP4: first 5 seconds, 10fps, square crop, no audio
  const tmpInput = path.join(os.tmpdir(), `${movieId}-input.${type.ext}`);
  try {
    await fs.writeFile(tmpInput, req.body);
    await execFileAsync("ffmpeg", [
      "-i",
      tmpInput,
      "-t",
      "5",
      "-r",
      "10",
      "-vf",
      "crop='min(iw,ih)':'min(iw,ih)',scale=360:360",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-crf",
      "28",
      "-profile:v",
      "baseline",
      "-an",
      "-movflags",
      "+faststart",
      "-y",
      outputPath,
    ], { timeout: 60_000, maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown ffmpeg error";
    console.error("[movie] ffmpeg conversion failed:", message);
    throw new httpErrors.InternalServerError(`Video conversion failed: ${message}`);
  } finally {
    await fs.unlink(tmpInput).catch(() => {});
  }

  return res.status(200).type("application/json").send({ id: movieId });
});
