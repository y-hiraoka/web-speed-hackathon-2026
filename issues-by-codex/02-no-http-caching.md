# 静的配信が常時非キャッシュかつ Keep-Alive 無効化で往復増大

## カテゴリ
サーバー / アセット

## 影響するメトリクス
LCP / TTFB / 転送量

## 影響度
高

## 作業規模
S

## 問題の原因
全レスポンスに `Cache-Control: max-age=0, no-transform` と `Connection: close` を付与し、`serve-static` でも `etag` と `lastModified` を無効化しているため、画像・フォント・JS/CSS が毎回再取得され、HTTP/1.1 の持続接続も切られて往復が増えている。

## 原因箇所
- [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts#L16-L21)
- [application/server/src/routes/static.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/static.ts#L16-L34)

## 解決方法
- 静的ファイルには長めの `Cache-Control` と `ETag` / `Last-Modified` を有効化し、アプリ固有ヘッダーは API のみに限定する。
- `Connection: close` を外し、Keep-Alive を活かして同一 TCP で複数リソースを配信する。
- アセットの fingerprinting（contenthash）と組み合わせてキャッシュ破棄を管理する。

## 依存関係・注意点
`fly.toml` は変更不可だが、ヘッダー設定はアプリ側で制御可能。VRT に影響しない範囲で実施。
