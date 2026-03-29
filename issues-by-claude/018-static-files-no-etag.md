# 静的ファイル配信で ETag と Last-Modified が無効化されている

## カテゴリ

サーバー

## 影響するメトリクス

LCP / TTFB

## 影響度

中

## 作業規模

S

## 問題の原因

`serve-static` の設定で `etag: false` と `lastModified: false` が全ての静的ファイルディレクトリに設定されている。これによりブラウザのキャッシュ検証（304 Not Modified）が機能せず、毎回完全なレスポンスが返される。

## 原因箇所

`application/server/src/routes/static.ts:17-20` (UPLOAD_PATH)
`application/server/src/routes/static.ts:24-27` (PUBLIC_PATH)
`application/server/src/routes/static.ts:31-34` (CLIENT_DIST_PATH)

## 解決方法

1. `etag: true` と `lastModified: true` に変更（デフォルト値に戻す）
2. Cache-Control ヘッダーの修正（issue 017）と合わせて、静的ファイルに適切なキャッシュヘッダーを設定

## 依存関係・注意点

- Cache-Control ヘッダーの修正（issue 017）と合わせて実施
