import { promises as fs } from "fs";
import os from "os";
import path from "path";

import { Router } from "express";
import { fileTypeFromBuffer } from "file-type";
import httpErrors from "http-errors";
import { v4 as uuidv4 } from "uuid";

import { UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";
import { runFFmpeg } from "@web-speed-hackathon-2026/server/src/utils/ffmpeg";

const EXTENSION = "mp4";

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
]);

export const movieRouter = Router();

movieRouter.post("/movies", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }
  if (Buffer.isBuffer(req.body) === false) {
    throw new httpErrors.BadRequest();
  }

  const type = await fileTypeFromBuffer(req.body);
  if (type === undefined || !ALLOWED_VIDEO_MIMES.has(type.mime)) {
    throw new httpErrors.BadRequest("Invalid file type");
  }

  const movieId = uuidv4();
  const tmpInput = path.join(os.tmpdir(), `${uuidv4()}.${type.ext}`);
  const outputDir = path.resolve(UPLOAD_PATH, "movies");
  const outputPath = path.resolve(outputDir, `${movieId}.${EXTENSION}`);

  try {
    await fs.writeFile(tmpInput, req.body);
    await fs.mkdir(outputDir, { recursive: true });

    await runFFmpeg([
      "-y",
      "-i", tmpInput,
      "-t", "5",
      "-r", "10",
      "-vf", "crop='min(iw,ih)':'min(iw,ih)',scale=640:640",
      "-an",
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "28",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      outputPath,
    ]);
  } finally {
    await fs.unlink(tmpInput).catch(() => {});
  }

  return res.status(200).type("application/json").send({ id: movieId });
});
