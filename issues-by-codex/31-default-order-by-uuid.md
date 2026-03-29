# 投稿一覧を UUID の降順でソートしインデックスが効かずソートコストが高い

## カテゴリ
サーバー / DB

## 影響するメトリクス
TTFB / CPU

## 影響度
低

## 作業規模
S

## 問題の原因
`Post` の `defaultScope` で `order: [["id","DESC"]]` としているが、`id` は UUID で時間順ではなく、索引効率も悪い。新着順を求めるクエリが UUID ソートになり、SQLite で不要なソート処理が発生する。

## 原因箇所
- [application/server/src/models/Post.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/models/Post.ts#L62-L65)

## 解決方法
- 作成日時に基づく `createdAt DESC` を主キーにし、必要なら `createdAt` にインデックスを追加する。
- UUID 順の order を外し、表示順はアプリケーションで明示的に指定する。

## 依存関係・注意点
既存クエリの order が変わるためテスト確認が必要。
