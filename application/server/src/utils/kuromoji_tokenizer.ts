import { createRequire } from "node:module";
import path from "node:path";

import kuromoji, { type IpadicFeatures, type Tokenizer } from "kuromoji";

const require = createRequire(import.meta.url);
const dicPath = path.resolve(path.dirname(require.resolve("kuromoji/package.json")), "dict");

const tokenizerPromise = new Promise<Tokenizer<IpadicFeatures>>((resolve, reject) => {
  kuromoji.builder({ dicPath }).build((err, tokenizer) => {
    if (err) reject(err);
    else resolve(tokenizer);
  });
});

export function getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  return tokenizerPromise;
}
