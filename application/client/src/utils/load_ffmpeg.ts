import type { FFmpeg } from "@ffmpeg/ffmpeg";

export async function loadFFmpeg(): Promise<FFmpeg> {
  const [{ FFmpeg: FFmpegClass }, { default: coreUrl }, { default: wasmUrl }] = await Promise.all([
    import("@ffmpeg/ffmpeg"),
    import("@ffmpeg/core?url"),
    import("@ffmpeg/core/wasm?url"),
  ]);

  const ffmpeg = new FFmpegClass();

  await ffmpeg.load({
    coreURL: coreUrl,
    wasmURL: wasmUrl,
  });

  return ffmpeg;
}
