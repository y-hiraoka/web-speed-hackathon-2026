# /initialize 呼び出し毎にテンポラリ DB を作りっぱなしでディスクが肥大

## カテゴリ
サーバー / インフラ

## 影響するメトリクス
ディスク使用量 / 起動時間 / TTFB（I/O競合時）

## 影響度
低

## 作業規模
S

## 問題の原因
`initializeSequelize` は毎回 `fs.mkdtemp` で一時ディレクトリを作成し元の sqlite をコピーするが、古いテンポラリファイルを削除していない。ベンチマークやリセットを繰り返すと `/tmp` に DB コピーが溜まり、ディスク圧迫と I/O 低下を招く。

## 原因箇所
- [application/server/src/sequelize.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/sequelize.ts#L12-L28)
- [application/server/src/routes/api/initialize.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/initialize.ts#L10-L20)

## 解決方法
- 使い終わったテンポラリ DB を削除するか、固定パスにコピーして上書きする。
- あるいはメモリ SQLite を使い起動時のみシードを流す方式に変える。

## 依存関係・注意点
リセット API の応答時間が変わらないことを確認する。
