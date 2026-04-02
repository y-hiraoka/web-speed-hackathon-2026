import { promises as fs } from "fs";
import path from "path";

import exifReader from "exif-reader";
import { Router } from "express";
import httpErrors from "http-errors";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

import { UPLOAD_PATH } from "@web-speed-hackathon-2026/server/src/paths";

export const imageRouter = Router();

function extractAltFromExif(metadata: sharp.Metadata): string {
  if (metadata.exif) {
    try {
      const exif = exifReader(metadata.exif);
      const exifAny = exif as unknown as Record<string, Record<string, unknown>>;
      const raw =
        exifAny?.["Image"]?.["ImageDescription"] ?? exifAny?.["image"]?.["ImageDescription"];
      if (raw) {
        return Buffer.isBuffer(raw) ? raw.toString("utf8").replace(/\0/g, "") : String(raw);
      }
    } catch {
      // parse error, skip
    }
  }
  return "";
}

/**
 * Extract ImageDescription (tag 270) directly from TIFF IFD.
 * Sharp does not expose TIFF tags via its EXIF API, so we parse the raw bytes.
 */
function extractAltFromTiff(buf: Buffer): string {
  if (buf.length < 8) return "";
  const sig = buf.subarray(0, 2).toString("ascii");
  let readUint16: (offset: number) => number;
  let readUint32: (offset: number) => number;
  if (sig === "II") {
    readUint16 = (o) => buf.readUInt16LE(o);
    readUint32 = (o) => buf.readUInt32LE(o);
  } else if (sig === "MM") {
    readUint16 = (o) => buf.readUInt16BE(o);
    readUint32 = (o) => buf.readUInt32BE(o);
  } else {
    return "";
  }
  const magic = readUint16(2);
  if (magic !== 42) return "";
  const ifdOffset = readUint32(4);
  if (ifdOffset + 2 > buf.length) return "";
  const numEntries = readUint16(ifdOffset);
  for (let i = 0; i < numEntries; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > buf.length) break;
    const tag = readUint16(entryOffset);
    if (tag === 270) {
      // ImageDescription: type ASCII (2), count includes null terminator
      const count = readUint32(entryOffset + 4);
      let dataOffset: number;
      if (count <= 4) {
        dataOffset = entryOffset + 8;
      } else {
        dataOffset = readUint32(entryOffset + 8);
      }
      if (dataOffset + count > buf.length) return "";
      return buf
        .subarray(dataOffset, dataOffset + count)
        .toString("utf8")
        .replace(/\0/g, "");
    }
  }
  return "";
}

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
  let alt = extractAltFromExif(metadata);
  // Fallback: parse TIFF IFD directly for ImageDescription (tag 270)
  if (!alt && metadata.format === "tiff") {
    alt = extractAltFromTiff(req.body as Buffer);
  }

  return res.status(200).type("application/json").send({ id: imageId, ext, width, height, alt });
});
