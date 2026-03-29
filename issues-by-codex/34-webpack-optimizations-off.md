# Webpack 最適化フラグを全面無効化し不要なコードをそのまま配信

## カテゴリ
ビルド

## 影響するメトリクス
LCP / TBT / 転送量

## 影響度
高

## 作業規模
S

## 問題の原因
`optimization` で `splitChunks: false` `concatenateModules: false` `usedExports: false` `providedExports: false` `sideEffects: false` と設定し、ツリーシェイキング・スコープホイスティング・コード分割を全て無効化している。結果として未使用コードや重複依存がそのままバンドルに残り、サイズと実行コストが膨らんでいる。

## 原因箇所
- [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L130-L136)

## 解決方法
- `optimization` をデフォルト（production）に戻し、必要な箇所だけカスタマイズする。
- `splitChunks` でベンダー/メディア変換など重い依存を分離する。

## 依存関係・注意点
01 の「本番最適化されていない」と合わせて対応する。
