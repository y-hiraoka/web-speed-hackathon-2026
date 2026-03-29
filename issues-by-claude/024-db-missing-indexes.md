# データベースにインデックスが設定されていない

## カテゴリ

DB

## 影響するメトリクス

TTFB

## 影響度

高

## 作業規模

S

## 問題の原因

SQLite データベースに主キー以外のインデックスが一切設定されていない。以下の頻繁に使用されるカラムでフルテーブルスキャンが発生する：

- `Posts.userId` — ユーザーの投稿取得時
- `Posts.createdAt` — 投稿のソート・日付フィルタ時
- `Comments.postId` — 投稿のコメント取得時
- `Comments.createdAt` — コメントのソート時
- `DirectMessages.conversationId` — 会話のメッセージ取得時
- `DirectMessages.senderId` — 未読カウント時
- `DirectMessages.isRead` — 未読フィルタ時
- `DirectMessages.createdAt` — メッセージのソート時
- `DirectMessageConversations.initiatorId` — 会話リスト取得時
- `DirectMessageConversations.memberId` — 会話リスト取得時
- `PostsImagesRelations.postId` / `imageId` — 投稿画像の関連取得時
- `Posts.text` — テキスト検索時（LIKE 検索）

特に DirectMessages テーブルは 198,844 レコードあり、インデックスなしでの検索は非常に遅い。

## 原因箇所

`application/server/src/models/` — 全モデルファイル（インデックス定義なし）

## 解決方法

Sequelize のモデル定義にインデックスを追加：

```typescript
{
  sequelize,
  indexes: [
    { fields: ["userId"] },
    { fields: ["createdAt"] },
  ],
}
```

または、シードスクリプトで直接 SQL を実行：

```sql
CREATE INDEX idx_posts_user_id ON Posts(userId);
CREATE INDEX idx_posts_created_at ON Posts(createdAt);
CREATE INDEX idx_comments_post_id ON Comments(postId);
CREATE INDEX idx_dm_conversation_id ON DirectMessages(conversationId);
CREATE INDEX idx_dm_sender_read ON DirectMessages(senderId, isRead);
CREATE INDEX idx_dmc_initiator ON DirectMessageConversations(initiatorId);
CREATE INDEX idx_dmc_member ON DirectMessageConversations(memberId);
```

## 依存関係・注意点

- N+1 クエリの修正（issue 025）と合わせて実施すると効果的
- シードデータの初期化時にインデックスが作成されるよう注意
