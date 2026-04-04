# TASK-11: DM 送信フローの TBT を改善する

## 影響箇所

ユーザーフロー: DM送信 TBT（25点満点中 0.25点）

## 現状

TBT 0.25/25。メッセージ入力・送信中のメインスレッドブロッキングが激しい。

## 原因

1. **メッセージ入力時の re-render**: 各キーストロークで textarea の state 更新 + DirectMessagePage 全体の re-render
2. **メッセージ送信後の loadConversation()**: 全メッセージ再取得 + 全件 re-render
3. **ResizeObserver + scrollTo**: メッセージ追加時の自動スクロールが連鎖的に実行

## 対応方針

1. **メッセージ入力を uncontrolled component にする**: useRef で値を管理
2. **送信後のメッセージ追加を楽観的更新にする**: loadConversation() の代わりに、送信したメッセージをローカル state に追加
3. **メッセージリストのレンダリングを memo 化**: 既存メッセージの re-render を防止

## 関連ファイル

- `application/client/src/components/direct_message/DirectMessagePage.tsx`
- `application/client/src/containers/DirectMessageContainer.tsx`

## 期待効果

TBT +10〜20点
