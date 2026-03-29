# Webpack ビルドキャッシュ無効で CI/ローカルビルドが極端に遅い

## カテゴリ
ビルド

## 影響するメトリクス
開発生産性 / デプロイ時間（TTFB 間接的影響）

## 影響度
低

## 作業規模
S

## 問題の原因
`cache: false` によりビルドキャッシュが完全に無効化され、毎回フルビルドが走る。デプロイ・計測前のビルド時間が増大し、最適化作業の反復が遅くなる。

## 原因箇所
- [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L137-L138)

## 解決方法
- `cache: { type: "filesystem" }` を有効化し、ハードソースキャッシュで差分ビルドを高速化する。
- 併せて `thread-loader` や `esbuild-loader` 導入でビルド時間を短縮する。

## 依存関係・注意点
キャッシュ破損時のクリア手段を README に記載すると親切。
