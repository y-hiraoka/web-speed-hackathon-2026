# Sequelize logging を一律無効にし N+1 や重クエリを検知しづらい

## カテゴリ
ビルド / 運用

## 影響するメトリクス
（間接）TTFB / スループット

## 影響度
低

## 作業規模
S

## 問題の原因
`logging: false` がグローバルに設定され、実行クエリが可視化されていない。N+1 やテーブルスキャンが発生しても気付きにくく、最適化機会を逃す。

## 原因箇所
- [application/server/src/sequelize.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/sequelize.ts#L21-L27)

## 解決方法
- 本番と計測環境を分け、ベンチ中は slow query ログや APM を有効化する。
- テスト・ローカルでは `logging` を有効にしてクエリを確認し、N+1 を潰す。

## 依存関係・注意点
本番でのログ量に注意し、サンプリングやスロークエリのみに絞る。
