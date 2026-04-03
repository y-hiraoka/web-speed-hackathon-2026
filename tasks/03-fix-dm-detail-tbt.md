# TASK-03: DM 詳細ページの TBT 低下を修正する

## 影響

TBT が 30.00 → 2.10 に低下（-27.90点）

## 原因

issue 修正で導入した変更の副作用の可能性。候補:

- issue #27: `withMessages` スコープ削除と `DirectMessage.findAll` への置き換え
- issue #26: WebSocket ハートビート追加
- issue #28: 未読カウントのサブクエリ化

## 対応方針

DM 詳細ページのレスポンスとクライアント側レンダリングをプロファイルし、TBT 増加の原因を特定して修正。

## 関連ファイル

- `application/server/src/routes/api/direct_message.ts`
- `application/client/src/containers/DirectMessageContainer.tsx`
- `application/client/src/components/direct_message/DirectMessagePage.tsx`
- `application/client/src/hooks/use_ws.ts`

## 期待効果

TBT +28点
