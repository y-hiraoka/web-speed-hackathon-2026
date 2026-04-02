import { promises as fs } from "fs";
import os from "os";
import path from "path";

import { Router } from "express";
import { fileTypeFromBuffer } from "file-type";
import httpErrors from "http-errors";
import { v4 as uuidv4 } from "uuid";

import { PUBLIC_PATH, UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";
import { extractMetadataFromSound } from "@web-speed-hackathon-2026/server/src/utils/extract_metadata_from_sound";
import { runFFmpeg, runFFmpegToBuffer } from "@web-speed-hackathon-2026/server/src/utils/ffmpeg";

const EXTENSION = "mp3";

const ALLOWED_AUDIO_MIMES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/flac",
  "audio/ogg",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
  "video/mp4",
]);

export const soundRouter = Router();

soundRouter.post("/sounds", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }
  if (Buffer.isBuffer(req.body) === false) {
    throw new httpErrors.BadRequest();
  }

  const type = await fileTypeFromBuffer(req.body);
  if (type === undefined || !ALLOWED_AUDIO_MIMES.has(type.mime)) {
    throw new httpErrors.BadRequest("Invalid file type");
  }

  const soundId = uuidv4();
  const tmpInput = path.join(os.tmpdir(), `${uuidv4()}.${type.ext}`);
  const tmpOutput = path.join(os.tmpdir(), `${uuidv4()}.${EXTENSION}`);
  const outputDir = path.resolve(UPLOAD_PATH, "sounds");
  const outputPath = path.resolve(outputDir, `${soundId}.${EXTENSION}`);

  try {
    await fs.writeFile(tmpInput, req.body);
    await fs.mkdir(outputDir, { recursive: true });

    await runFFmpeg([
      "-y",
      "-i", tmpInput,
      "-vn",
      "-c:a", "libmp3lame",
      "-q:a", "4",
      tmpOutput,
    ]);

    const mp3Buffer = await fs.readFile(tmpOutput);
    const { artist, title } = await extractMetadataFromSound(mp3Buffer);
    await fs.writeFile(outputPath, mp3Buffer);

    return res.status(200).type("application/json").send({ artist, id: soundId, title });
  } finally {
    await fs.unlink(tmpInput).catch(() => {});
    await fs.unlink(tmpOutput).catch(() => {});
  }
});

soundRouter.get("/sounds/:soundId", async (req, res) => {
  const { soundId } = req.params;

  // public と upload の両方からファイルを探す
  const candidates = [
    path.resolve(UPLOAD_PATH, `sounds/${soundId}.${EXTENSION}`),
    path.resolve(PUBLIC_PATH, `sounds/${soundId}.${EXTENSION}`),
  ];

  let filePath: string | undefined;
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      filePath = candidate;
      break;
    } catch {
      // continue
    }
  }

  if (filePath === undefined) {
    throw new httpErrors.NotFound();
  }

  // ffmpeg で PCM データを抽出し、波形を計算
  const pcmBuffer = await runFFmpegToBuffer([
    "-i", filePath,
    "-f", "f32le",
    "-ac", "1",
    "-ar", "8000",
    "pipe:1",
  ]);

  const samples = new Float32Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.byteLength / 4);
  const chunkSize = Math.ceil(samples.length / 100);
  const peaks: number[] = [];

  for (let i = 0; i < 100; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, samples.length);
    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += Math.abs(samples[j]!);
    }
    peaks.push(sum / (end - start));
  }

  const max = Math.max(...peaks);
  const normalized = max > 0 ? peaks.map((p) => p / max) : peaks;

  return res.status(200).type("application/json").send({ peaks: normalized });
});
