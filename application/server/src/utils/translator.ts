import { pipeline } from "@huggingface/transformers";

const translator = await pipeline("translation", "Xenova/opus-mt-ja-en", { dtype: "q8" });

export async function translate(text: string): Promise<string> {
  const result = await translator(text);
  const output = Array.isArray(result) ? result[0] : result;
  return (output as { translation_text: string }).translation_text;
}
