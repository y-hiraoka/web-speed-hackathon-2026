# 本番配信に inline-source-map を同梱し JS 体積が増大

## カテゴリ
ビルド

## 影響するメトリクス
LCP / 転送量

## 影響度
中

## 作業規模
S

## 問題の原因
`devtool: "inline-source-map"` が本番ビルドでも有効なままで、ソースマップがバンドルに埋め込まれる。数 MB の不要データを配信し、初回ダウンロードを遅らせる。

## 原因箇所
- [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L16-L29)

## 解決方法
- 本番ビルドでは `devtool: false` もしくは `source-map` に切り替え、デプロイ時はマップを別出力にする。

## 依存関係・注意点
ステージングでデバッグしたい場合は環境変数で切り替える。
