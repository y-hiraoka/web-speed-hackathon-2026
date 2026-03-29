# /initialize が upload ディレクトリを rm -r し I/O が重い上にキャッシュが毎回失効

## カテゴリ
サーバー / アセット

## 影響するメトリクス
TTFB / ディスク I/O / キャッシュヒット率

## 影響度
低

## 作業規模
S

## 問題の原因
ベンチマーク毎に `/api/v1/initialize` が `rm -r upload` を実行し、アップロード済みファイルを全削除する。大量ファイルがあると I/O が大きく、以後のアクセスでキャッシュがすべてミスになり再転送が発生する。

## 原因箇所
- [application/server/src/routes/api/initialize.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/initialize.ts#L12-L19)

## 解決方法
- 初期化時は既存ファイルを再利用するか、シード段階で軽量なダミーファイルのみにする。
- どうしても削除する場合は非同期ストリーミング削除や遅延削除で I/O ピークを抑える。

## 依存関係・注意点
ベンチ仕様によりアップロード内容を保持すべきか確認する。
