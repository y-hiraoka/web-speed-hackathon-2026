# 投稿取得がデフォルトで全関連を JOIN しレスポンスが過大

## カテゴリ
サーバー / DB

## 影響するメトリクス
TTFB / LCP / 転送量

## 影響度
高

## 作業規模
M

## 問題の原因
`Post` モデルの `defaultScope` がユーザー・プロフィール画像・添付画像（中間テーブル経由）・動画・音声を常に `include` し、`order` も複数列で指定している。タイムラインや検索で `Post.findAll` を呼ぶたびに全関連を JOIN して返すため、1 件あたりの JSON が肥大化し、クエリも重くなる。

## 原因箇所
- [application/server/src/models/Post.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/models/Post.ts#L45-L66)

## 解決方法
- 一覧用スコープを定義し、本文とユーザーの最小限フィールドだけ返すようにする。
- 画像・動画・音声は必要時に別エンドポイントや遅延ロードで取得する。
- 既存クエリには適切なスコープを明示し、`order` も索引用カラムに限定する。

## 依存関係・注意点
API レスポンス形が変わるためフロント側のデータ依存を確認する。VRT 影響に注意。
