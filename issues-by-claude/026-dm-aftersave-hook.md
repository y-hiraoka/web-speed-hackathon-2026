# DirectMessage の afterSave フックで重いクエリが毎回実行される

## カテゴリ

DB / サーバー

## 影響するメトリクス

TTFB

## 影響度

中

## 作業規模

S

## 問題の原因

`DirectMessage` モデルの `afterSave` フックで、メッセージの保存（作成・更新）のたびに以下の処理が実行される：

1. `DirectMessage.findByPk()` — 保存したメッセージを再取得（defaultScope の include 付き）
2. `DirectMessageConversation.findByPk()` — 会話を取得（defaultScope で全メッセージ含む）
3. `DirectMessage.count()` — 未読メッセージ数を JOIN 付きでカウント

特に `individualHooks: true` で一括更新（既読処理）する場合、対象メッセージ1件ごとにこのフックが発火し、大量のクエリが実行される。

## 原因箇所

`application/server/src/models/DirectMessage.ts:75-107`
`application/server/src/routes/api/direct_message.ts:203-209` (`individualHooks: true`)

## 解決方法

1. `afterSave` フック内のクエリを最適化：
   - `findByPk` の代わりにフック引数の `message` を直接使用
   - `DirectMessageConversation.findByPk` は `unscoped()` で必要なフィールドのみ取得
   - 未読カウントのクエリにインデックスを活用
2. 既読更新時の `individualHooks: true` を `false` に変更し、一括更新後に1回だけ通知
3. 未読カウントはキャッシュして差分更新する

## 依存関係・注意点

- WebSocket 通知の即時性に影響する可能性があるが、パフォーマンスとのトレードオフ
- インデックス追加（issue 024）と合わせて実施
