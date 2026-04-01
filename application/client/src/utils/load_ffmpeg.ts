import { FFmpeg } from "@ffmpeg/ffmpeg";

export async function loadFFmpeg(): Promise<FFmpeg> {
  const ffmpeg = new FFmpeg();

  const coreUrl = new URL("../../node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js", import.meta.url).href;
  const wasmUrl = new URL("../../node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.wasm", import.meta.url).href;

  await ffmpeg.load({
    coreURL: coreUrl,
    wasmURL: wasmUrl,
  });

  return ffmpeg;
}
