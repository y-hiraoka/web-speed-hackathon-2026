# コード分割が行われず全依存が単一バンドルに含まれる

## カテゴリ

ビルド / クライアント

## 影響するメトリクス

LCP / TBT / FCP

## 影響度

高

## 作業規模

M

## 問題の原因

`splitChunks: false` かつ動的 import (`import()`) が一切使われていないため、以下の巨大ライブラリが全て初期バンドルに含まれる：

- `@mlc-ai/web-llm` — WebLLM エンジン（翻訳機能でのみ使用）
- `@ffmpeg/ffmpeg` + `@ffmpeg/core` — FFmpeg WASM（動画アップロード時のみ使用）
- `@imagemagick/magick-wasm` — ImageMagick WASM（画像アップロード時のみ使用）
- `kuromoji` — 形態素解析（検索時のみ使用）
- `bayesian-bm25` — BM25 検索（検索時のみ使用）
- `react-syntax-highlighter` — コードハイライト（Crok ページでのみ使用）
- `rehype-katex` / `remark-math` — 数式レンダリング（Crok ページでのみ使用）
- `react-markdown` — Markdown レンダリング（Crok ページでのみ使用）
- `redux-form` — フォーム管理（認証モーダルでのみ使用）

初期ロードに不要な機能のコードが全て含まれるため、バンドルサイズが非常に大きくなる。

## 原因箇所

`application/client/webpack.config.js:131` (`splitChunks: false`)
`application/client/webpack.config.js:62-63` (`chunkFormat: false` により動的 import も機能しない）

## 解決方法

1. `splitChunks` を有効化し、vendor chunk を分離
2. ページ/機能単位で `React.lazy()` + `import()` を使った遅延ロードを導入：
   - Crok ページ（react-markdown, katex, syntax-highlighter）
   - 翻訳機能（web-llm）
   - ファイルアップロード（ffmpeg, imagemagick）
   - 検索機能（kuromoji, bm25）
3. `chunkFormat` のデフォルト値に戻す

## 依存関係・注意点

- webpack の `mode: "production"` への変更（issue 001）と合わせて行うと効果的
- `chunkFormat: false` を先に修正しないと動的 import が機能しない
