# gzip/Brotli 圧縮が無効で大型アセット・API を生で送信

## カテゴリ
サーバー / アセット

## 影響するメトリクス
LCP / TTFB / 転送量

## 影響度
中

## 作業規模
S

## 問題の原因
Express に圧縮ミドルウェアが入っておらず、JS/CSS/HTML/JSON などテキスト系レスポンスが非圧縮で配信される。バンドルや API 応答が大きい現状では、ネットワーク転送が律速になり初回表示が遅れる。

## 原因箇所
- [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts)（圧縮ミドルウェアなし）

## 解決方法
- `compression` ミドルウェアや `@fastify/compress` 等を導入し、静的/動的レスポンスを gzip もしくは Brotli で圧縮する。
- 画像や動画などバイナリは対象外にしつつ、キャッシュ設定と併用する。

## 依存関係・注意点
CPU 使用量とレイテンシのトレードオフを確認。fly.io の帯域/CPU 制約を踏まえ事前圧縮ファイルの配信も検討。
