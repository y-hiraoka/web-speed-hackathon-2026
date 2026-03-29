# Webpack でミニファイ・最適化が全て無効化されている

## カテゴリ

ビルド

## 影響するメトリクス

LCP / TBT / TTFB

## 影響度

高

## 作業規模

S

## 問題の原因

`webpack.config.js` で `mode: "none"` が設定されており、`optimization` セクションで以下の全てが無効化されている：
- `minimize: false` — JS/CSS のミニファイが行われない
- `splitChunks: false` — コード分割が行われない
- `concatenateModules: false` — モジュール連結が行われない
- `usedExports: false` — Tree Shaking が無効
- `providedExports: false`
- `sideEffects: false`
- `cache: false` — ビルドキャッシュも無効

さらに `chunkFormat: false` により chunk のフォーマットも無効化されている。

結果として、巨大な未圧縮の単一バンドルが生成され、不要なコードも全て含まれる。

## 原因箇所

`application/client/webpack.config.js:39` (`mode: "none"`)
`application/client/webpack.config.js:130-137` (`optimization` セクション)
`application/client/webpack.config.js:138` (`cache: false`)

## 解決方法

1. `mode` を `"production"` に変更
2. `optimization` を以下のように設定：
   - `minimize: true` + TerserPlugin / CssMinimizerPlugin
   - `splitChunks` を有効化（vendor chunk 分離など）
   - `concatenateModules: true`
   - `usedExports: true` で Tree Shaking 有効化
   - `sideEffects: true`
3. `chunkFormat` を削除（デフォルトに戻す）
4. `cache` を `true` または `filesystem` に変更

## 依存関係・注意点

- `NODE_ENV=development` でビルドしている点 (`package.json` の `build` スクリプト) も同時に修正が必要
- `devtool: "inline-source-map"` も production では `source-map` または削除すべき（issue 002 参照）
