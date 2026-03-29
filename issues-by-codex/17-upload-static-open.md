# /upload 配下をキャッシュ無しで公開配信し I/O 負荷と転送量が増大

## カテゴリ
サーバー / アセット

## 影響するメトリクス
TTFB / LCP / 転送量

## 影響度
中

## 作業規模
S

## 問題の原因
`/upload` ディレクトリを `serveStatic` でそのまま公開しつつ `etag: false` `lastModified: false` でキャッシュを無効化している。ユーザーアップロードファイルも毎回ディスクから読み直しとなり、アクセスが増えるほど I/O と転送量が嵩む。

## 原因箇所
- [application/server/src/routes/static.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/static.ts#L16-L21)

## 解決方法
- アップロードファイルにも適切な `Cache-Control`/`ETag` を付与する（更新時はファイル名を contenthash で管理）。
- 不要な一覧アクセスを防ぐためディレクトリリスティングを抑止し、必要最小限の公開パスに限定する。

## 依存関係・注意点
アップロードファイルのライフサイクル設計（削除・上書き）と合わせてキャッシュ戦略を決める。
