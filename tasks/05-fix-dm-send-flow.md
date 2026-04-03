# TASK-05: DM 送信ユーザーフローを修正する

## 影響

計測不能 → 最大 50点獲得可能

## エラー

"メッセージの送信完了を待機中にタイムアウトしました"

## 原因候補

- cookie-session が WebSocket upgrade リクエストに適用されず `req.session` が undefined
- メッセージ送信後に `<li>` 要素として表示されるまでの遅延
- `loadConversation()` の再取得が遅い or 失敗

## スコアリングツールの期待動作

1. サインイン → DM ページ → 「新しくDMを始める」クリック
2. ユーザー名 `g63iaxn5c` を入力 → 「DMを開始」
3. メッセージ入力（Shift+Enter で改行）→ Enter で送信
4. `<li>` にメッセージが表示されるのを待つ（30秒タイムアウト）

## 対応方針

WebSocket の認証フローを確認、cookie-session と WS upgrade の互換性を検証、メッセージ表示のフローを修正。

## 関連ファイル

- `application/server/src/utils/express_websocket_support.ts`
- `application/server/src/routes/api/direct_message.ts`
- `application/server/src/session.ts`
- `application/client/src/containers/DirectMessageContainer.tsx`
- `application/client/src/hooks/use_ws.ts`

## 期待効果

+50点（計測可能になった場合）
