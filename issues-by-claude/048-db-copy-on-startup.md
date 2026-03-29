# サーバー起動時に 94MB のデータベースファイルをコピーしている

## カテゴリ

サーバー / DB

## 影響するメトリクス

TTFB

## 影響度

低

## 作業規模

S

## 問題の原因

`sequelize.ts` でサーバー起動時に 94MB の `database.sqlite` を `/tmp/wsh-*/database.sqlite` にコピーしている。これにより起動時間が増加する。

また、SQLite の WAL (Write-Ahead Logging) モードが設定されていないため、読み書きの並行性が低い。

## 原因箇所

`application/server/src/sequelize.ts` — データベース初期化処理

## 解決方法

1. データベースファイルのコピーを最適化（シンボリックリンクの使用等）
2. SQLite の WAL モードを有効化：`PRAGMA journal_mode=WAL;`
3. その他の SQLite 最適化 PRAGMA を設定：
   - `PRAGMA synchronous=NORMAL;`
   - `PRAGMA cache_size=-64000;` (64MB キャッシュ)
   - `PRAGMA temp_store=MEMORY;`

## 依存関係・注意点

- `POST /initialize` でデータベースリセットする際にコピーが必要なため、コピー自体は削除不可
- WAL モードは fly.io の永続ストレージとの相性を確認する
