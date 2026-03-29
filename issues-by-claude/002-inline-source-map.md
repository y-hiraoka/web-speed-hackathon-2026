# inline-source-map がプロダクションビルドに含まれている

## カテゴリ

ビルド

## 影響するメトリクス

LCP / TTFB

## 影響度

高

## 作業規模

S

## 問題の原因

`webpack.config.js` で `devtool: "inline-source-map"` が設定されている。これにより、ソースマップがバンドルファイル内に Base64 エンコードで埋め込まれ、JS ファイルサイズが大幅に増加する（通常の2-3倍以上になる）。

## 原因箇所

`application/client/webpack.config.js:28`

## 解決方法

`devtool` を削除するか、`false` に設定する。デバッグが必要な場合は `"source-map"`（外部ファイル）にする。

## 依存関係・注意点

なし

## Vite 移行による解消見込み (issue 000)

**Vite に移行することで自然に解消される見込み。** Vite は production ビルドでソースマップをバンドルに埋め込まない（デフォルトで `build.sourcemap: false`）。`devtool: "inline-source-map"` に相当する設定は Vite では再現しないため、移行するだけで本 issue は解消される。

→ Vite 移行後に、ビルド成果物に inline source map が含まれていないことを確認するタスク。
