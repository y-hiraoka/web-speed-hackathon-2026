# 画像/動画アップロードで Buffer 判定→ file-type → uuid と同期でメモリを2重確保

## カテゴリ
サーバー

## 影響するメトリクス
メモリ使用量 / TTFB

## 影響度
低

## 作業規模
S

## 問題の原因
アップロード API は `Buffer.isBuffer(req.body)` で全ボディをメモリ保持したうえ `fileTypeFromBuffer` で再度先頭を読み、同期 UUID 生成・ファイル書き込みを行う。ストリーミング処理がなく、大きめのメディアでメモリ消費と GC が増える。

## 原因箇所
- [application/server/src/routes/api/image.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/image.ts#L12-L41)
- [application/server/src/routes/api/movie.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/movie.ts#L12-L41)

## 解決方法
- `multer` 等のストリーミングミドルウェアでファイルタイプ判定しつつディスクへストリーム書き込みする。
- サイズ上限と同時接続数を制御してメモリピークを抑える。

## 依存関係・注意点
アップロードフロー変更時は e2e で確認する。
