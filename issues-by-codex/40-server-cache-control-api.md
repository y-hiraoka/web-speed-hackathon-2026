# API レスポンスも静的アセット同様に Cache-Control: max-age=0 で毎回再取得

## カテゴリ
サーバー / API

## 影響するメトリクス
TTFB / 転送量

## 影響度
低

## 作業規模
S

## 問題の原因
グローバルミドルウェアで全レスポンスに `Cache-Control: max-age=0, no-transform` を付与しているため、API 結果もブラウザキャッシュされない。変更頻度の低いプロフィールや投稿詳細も毎回ネットワーク経由になり、往復とサーバー負荷が増える。

## 原因箇所
- [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts#L16-L21)

## 解決方法
- API でもリソース特性に応じて `ETag`/`Last-Modified` と適切な `Cache-Control` を返す（例: immutable なプロフィール画像など）。
- 認証情報を伴うエンドポイントは短期キャッシュ、公開情報は長期キャッシュに分ける。

## 依存関係・注意点
認証付きレスポンスのキャッシュ漏洩を防ぐため `private`/`no-store` も適宜使い分ける。
