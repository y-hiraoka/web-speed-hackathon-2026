import analyze from "negaposi-analyzer-ja";

import { getTokenizer } from "@web-speed-hackathon-2026/server/src/utils/kuromoji_tokenizer";

type SentimentLabel = "positive" | "negative" | "neutral";

export async function analyzeSentiment(text: string): Promise<SentimentLabel> {
  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(text);
  const score = analyze(tokens);

  if (score > 0.1) {
    return "positive";
  } else if (score < -0.1) {
    return "negative";
  } else {
    return "neutral";
  }
}
