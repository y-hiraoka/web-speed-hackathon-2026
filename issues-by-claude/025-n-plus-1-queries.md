# Sequelize の defaultScope による N+1 クエリ問題

## カテゴリ

DB / サーバー

## 影響するメトリクス

TTFB

## 影響度

高

## 作業規模

M

## 問題の原因

複数のモデルで `defaultScope` に `include` が設定されており、全てのクエリで自動的に関連テーブルが JOIN される：

1. **Post**: user + profileImage + images + movie + sound を常に JOIN
2. **Comment**: user + profileImage を常に JOIN
3. **DirectMessage**: sender + profileImage を常に JOIN
4. **DirectMessageConversation**: initiator + member + 全 messages + 各 sender + profileImage を常に JOIN

特に問題なのは DirectMessageConversation の defaultScope で、全メッセージ（198,844件）を含む全会話を一度にロードしようとする点。`/dm` エンドポイントでは会話一覧の表示に必要なのは最新メッセージのみだが、全メッセージが含まれる。

## 原因箇所

`application/server/src/models/Post.ts:44-66` (Post defaultScope)
`application/server/src/models/Comment.ts` (Comment defaultScope)
`application/server/src/models/DirectMessage.ts:62-72` (DirectMessage defaultScope)
`application/server/src/models/DirectMessageConversation.ts` (全メッセージを含む defaultScope)

## 解決方法

1. `defaultScope` を最小限にする（include を空にする）
2. 各エンドポイントで必要な include を明示的に指定：
   - 投稿一覧: user + profileImage のみ（images, movie, sound は不要な場合もある）
   - コメント一覧: user + profileImage
   - DM 会話一覧: initiator + member + 最新メッセージ1件のみ
   - DM 会話詳細: messages のページネーション付き
3. `attributes` で必要なカラムのみ選択

## 依存関係・注意点

- API レスポンスの構造が変わるため、クライアント側の対応も必要になる可能性がある
- インデックス追加（issue 024）と合わせて実施
