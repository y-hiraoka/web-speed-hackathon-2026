# TASK-06: Crok AI チャットフローの TBT を改善する

## 影響

Crok AI チャット TBT 0.00/25

## 原因

SSE ストリーミング中の DOM 更新が連続的で、RAF バッチ化済みだがまだ重い。ストリーミング完了後に MarkdownRenderer が一気にレンダリングされ、大量の DOM 操作が発生している可能性。

## 対応方針

1. ストリーミング完了後の Markdown レンダリングを startTransition で遅延
2. メッセージリストの不要な再レンダリングを防止
3. CrokPage のメッセージ追加時に既存メッセージを再レンダリングしない

## 関連ファイル

- `application/client/src/containers/CrokContainer.tsx`
- `application/client/src/components/crok/CrokPage.tsx`
- `application/client/src/components/crok/ChatMessage.tsx`
- `application/client/src/hooks/use_sse.ts`

## 期待効果

TBT +10〜20点
