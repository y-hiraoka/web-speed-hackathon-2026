# 検索 API が先頭ワイルドカード LIKE で全表スキャン＆二重クエリ

## カテゴリ
サーバー / DB

## 影響するメトリクス
TTFB / LCP / CPU

## 影響度
中

## 作業規模
M

## 問題の原因
`/api/v1/search` は `%${keywords}%` の先頭ワイルドカード LIKE を使うため SQLite でインデックスが効かず全件スキャンになるうえ、テキスト検索とユーザー名検索で `Post.findAll` を 2 回発行し、結果をメモリでマージして再度 `slice` している。`limit/offset` を各クエリとマージ後両方に適用しているため、ページングも不整合になり余計な読み込みが発生する。

## 原因箇所
- [application/server/src/routes/api/search.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/search.ts#L23-L90)

## 解決方法
- FTS5 などの全文検索インデックスを使うか、前方一致に寄せてインデックスを利用できる形にする。
- テキスト・ユーザー検索を単一クエリ（UNION か JOIN）にまとめ、DB 側で `limit/offset` を適用する。
- 取得フィールドを絞り、必要な関連は遅延ロードまたは select で最小限にする。

## 依存関係・注意点
検索仕様変更のため API クライアント側の pagination も要調整。
