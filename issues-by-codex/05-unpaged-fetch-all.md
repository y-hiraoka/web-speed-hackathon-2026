# 取得毎に全投稿を再ダウンロードしクライアント側でスライス

## カテゴリ
クライアント / サーバー

## 影響するメトリクス
TTFB / LCP / メモリ使用量 / ネットワーク転送量

## 影響度
高

## 作業規模
M

## 問題の原因
無限スクロールフックが `fetcher(apiPath)` を毎回全件取得し、`allData.slice(offset, offset + LIMIT)` だけを追加するため、追加読み込みのたびに全投稿（関連ユーザー・画像・動画付き）を再ダウンロードしている。サーバー側も `Post` の `defaultScope` でユーザー・画像・動画・サウンドを毎回 JOIN するため、応答が肥大化している。

## 原因箇所
- [application/client/src/hooks/use_infinite_fetch.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/hooks/use_infinite_fetch.ts#L12-L78)
- [application/server/src/models/Post.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/models/Post.ts#L45-L66)

## 解決方法
- クエリパラメータで `limit` と `offset`（または `cursor`）を渡し、サーバーでページングして必要分だけ返す。
- クライアントはサーバーから返った分をそのまま append し、全件再取得をやめる。
- サーバーは一覧用スコープを用意し、必要最小限のフィールドだけ返す（画像一覧やメディアは別 API で遅延取得するなど）。

## 依存関係・注意点
API 仕様変更になるため、検索やユーザ投稿一覧も同様のページング設計に合わせる。
