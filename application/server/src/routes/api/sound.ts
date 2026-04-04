import { execFile } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";

import { Router } from "express";
import { fileTypeFromBuffer } from "file-type";
import httpErrors from "http-errors";
import { v4 as uuidv4 } from "uuid";

import { Sound } from "@web-speed-hackathon-2026/server/src/models";
import { PUBLIC_PATH, UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";
import { extractMetadataFromSound } from "@web-speed-hackathon-2026/server/src/utils/extract_metadata_from_sound";

const execFileAsync = promisify(execFile);

// 変換した音声の拡張子
const EXTENSION = "mp3";

const waveformCache = new Map<string, { max: number; peaks: number[] }>();

async function computeWaveform(soundFilePath: string): Promise<{ max: number; peaks: number[] }> {
  // Use ffmpeg to decode MP3 to raw PCM (mono, 16-bit signed LE, 8kHz for speed)
  const { stdout } = await execFileAsync(
    "ffmpeg",
    [
      "-i",
      soundFilePath,
      "-f",
      "s16le",
      "-acodec",
      "pcm_s16le",
      "-ac",
      "1",
      "-ar",
      "8000",
      "-v",
      "quiet",
      "pipe:1",
    ],
    { encoding: "buffer", maxBuffer: 50 * 1024 * 1024 },
  );

  const pcmBuffer = stdout as unknown as Buffer;
  const sampleCount = pcmBuffer.length / 2; // 16-bit = 2 bytes per sample
  const samplesPerChunk = Math.ceil(sampleCount / 100);

  const peaks: number[] = [];
  for (let i = 0; i < 100; i++) {
    const start = i * samplesPerChunk;
    const end = Math.min(start + samplesPerChunk, sampleCount);
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      sum += Math.abs(pcmBuffer.readInt16LE(j * 2)) / 32768;
      count++;
    }
    peaks.push(count > 0 ? sum / count : 0);
  }

  const max = Math.max(...peaks, 0);
  return { max, peaks };
}

export const soundRouter = Router();

soundRouter.get("/sounds/:soundId/waveform", async (req, res) => {
  const soundId = req.params.soundId;

  // Check cache
  const cached = waveformCache.get(soundId);
  if (cached) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.status(200).type("application/json").send(cached);
  }

  // Try to find the sound file in upload or public directories
  const uploadPath = path.resolve(UPLOAD_PATH, `sounds/${soundId}.${EXTENSION}`);
  const publicPath = path.resolve(PUBLIC_PATH, `sounds/${soundId}.${EXTENSION}`);

  let soundFilePath: string | null = null;
  try {
    await fs.access(uploadPath);
    soundFilePath = uploadPath;
  } catch {
    try {
      await fs.access(publicPath);
      soundFilePath = publicPath;
    } catch {
      throw new httpErrors.NotFound();
    }
  }

  const waveform = await computeWaveform(soundFilePath);
  waveformCache.set(soundId, waveform);

  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  return res.status(200).type("application/json").send(waveform);
});

soundRouter.post("/sounds", async (req, res) => {
  if (req.session.userId === undefined) {
    throw new httpErrors.Unauthorized();
  }
  if (Buffer.isBuffer(req.body) === false) {
    throw new httpErrors.BadRequest();
  }

  const type = await fileTypeFromBuffer(req.body);
  if (type === undefined || !type.mime.startsWith("audio/")) {
    throw new httpErrors.BadRequest("Invalid file type");
  }

  const soundId = uuidv4();

  // Extract metadata from the original file before conversion
  const { artist, title } = await extractMetadataFromSound(req.body);

  const outputDir = path.resolve(UPLOAD_PATH, "sounds");
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.resolve(outputDir, `${soundId}.${EXTENSION}`);

  if (type.ext === EXTENSION) {
    // Already MP3, just save
    await fs.writeFile(outputPath, req.body);
  } else {
    // Convert to MP3 using ffmpeg
    const tmpInput = path.join(os.tmpdir(), `${soundId}-input.${type.ext}`);
    try {
      await fs.writeFile(tmpInput, req.body);
      const metadataArgs = [
        "-metadata",
        `artist=${artist ?? "Unknown Artist"}`,
        "-metadata",
        `title=${title ?? "Unknown Title"}`,
      ];
      await execFileAsync("ffmpeg", ["-i", tmpInput, ...metadataArgs, "-vn", "-y", outputPath]);
    } finally {
      await fs.unlink(tmpInput).catch(() => {});
    }
  }

  await Sound.create({ id: soundId, artist, title } as any);

  return res.status(200).type("application/json").send({ artist, id: soundId, title });
});
