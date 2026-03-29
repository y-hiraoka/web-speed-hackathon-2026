# 投稿・コメント API にデフォルトの limit が無く全件返却で応答肥大

## カテゴリ
サーバー / API

## 影響するメトリクス
TTFB / 転送量 / メモリ使用量

## 影響度
高

## 作業規模
S

## 問題の原因
`/api/v1/posts` や `/posts/:postId/comments`、ユーザー投稿一覧などで `limit`/`offset` が未指定の場合に全件を返す実装になっている。タイムライン初回や検索で大量の投稿を一括送信し、レスポンス・シリアライズ・転送コストが跳ね上がる。

## 原因箇所
- [application/server/src/routes/api/post.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/post.ts#L8-L36)
- [application/server/src/routes/api/user.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/user.ts#L52-L78)

## 解決方法
- サーバー側でデフォルト `limit`（例: 20〜50）を設定し、最大値をガードする。
- カーソルや `createdAt` ベースのページングに改修する。

## 依存関係・注意点
クライアントの無限スクロール実装と整合を取る必要がある。
