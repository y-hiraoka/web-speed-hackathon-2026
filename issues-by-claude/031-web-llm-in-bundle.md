# WebLLM（ブラウザ上 LLM）がバンドルに含まれている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

中

## 作業規模

M

## 問題の原因

翻訳機能に `@mlc-ai/web-llm` が使用されており、ブラウザ上で `gemma-2-2b-jpn-it-q4f16_1-MLC` モデルを実行する。このライブラリ自体がバンドルサイズを増加させ、モデルのダウンロード（数百MB〜数GB）はユーザーが翻訳ボタンを押すたびに発生する。

翻訳機能は「Show Translation」ボタンを押した時のみ使用されるが、ライブラリは初期バンドルに含まれる。

## 原因箇所

`application/client/src/utils/create_translator.ts:1` (`import { CreateMLCEngine } from "@mlc-ai/web-llm"`)
`application/client/src/components/post/TranslatableText.tsx:3` (`import { createTranslator }`)

## 解決方法

1. 翻訳機能をサーバーサイドに移行：サーバー上の翻訳 API を呼び出す
2. または `import()` で遅延ロード：
```typescript
const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
```
3. Web Worker 内で実行してメインスレッドをブロックしない
4. より軽量な翻訳 API（Google Translate API 等）への置き換えも検討

## 依存関係・注意点

- コード分割（issue 003）と合わせて実施
- 翻訳機能がVRTに含まれるか確認が必要
