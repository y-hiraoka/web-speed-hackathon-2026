# DM 会話一覧が全メッセージを一度にロードしている

## カテゴリ

サーバー / DB

## 影響するメトリクス

TTFB

## 影響度

高

## 作業規模

M

## 問題の原因

`GET /dm` エンドポイントで `DirectMessageConversation.findAll()` を呼び出す際、defaultScope により全会話の全メッセージ（198,844件）が一度にロードされる。

各メッセージには sender + profileImage の JOIN も含まれるため、実質的に DirectMessages テーブル全体 + Users テーブル + ProfileImages テーブルの JOIN 結果がメモリに展開される。

会話一覧の表示に必要なのは各会話の最新メッセージ1件のみ。

## 原因箇所

`application/server/src/routes/api/direct_message.ts:19-27`
`application/server/src/models/DirectMessageConversation.ts` (defaultScope)

## 解決方法

1. `/dm` エンドポイントでは `unscoped()` を使い、必要な情報のみ取得：
   - 各会話の最新メッセージ1件（サブクエリ or SQL Window Function）
   - initiator, member の基本情報
2. DM 個別ページ (`/dm/:conversationId`) ではメッセージのページネーションを実装
3. defaultScope からメッセージの include を削除

## 依存関係・注意点

- N+1 クエリの修正（issue 025）と合わせて実施
- クライアント側の DM コンポーネントも対応が必要
