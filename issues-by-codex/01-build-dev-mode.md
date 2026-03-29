# ビルドが本番最適化されておらず巨大バンドルを配信

## カテゴリ
ビルド

## 影響するメトリクス
LCP / TBT / TTI / 転送量

## 影響度
高

## 作業規模
M

## 問題の原因
本番ビルドなのに `NODE_ENV=development` を強制し、Webpack の `mode: "none"`・`minimize: false`・`splitChunks: false`・`concatenateModules: false`・`usedExports: false` など最適化をすべて無効化している。さらに `devtool: "inline-source-map"` でソースマップをバンドルに内包し、React/Redux も開発ビルドを配信するためバンドルサイズと実行コストが極端に膨らんでいる。

## 原因箇所
- [application/client/package.json](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/package.json#L7-L9)
- [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L28-L138)

## 解決方法
- `NODE_ENV=production` でビルドするスクリプトに変更し、Webpack の `mode: "production"` を指定する。
- `devtool` を本番では無効もしくは `source-map` に落とす。
- デフォルトの最適化（minify, tree-shaking, module concatenation, splitChunks）を有効化し、必要に応じて `splitChunks` でベンダー分割を行う。
- React/Redux などのライブラリが production ビルドを利用することを確認する。

## 依存関係・注意点
なし
