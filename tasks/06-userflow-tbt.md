# TASK-06: ユーザーフロー TBT を改善する（認証・Crok）

## 影響箇所

- ユーザーフロー: 登録→サインイン TBT 0.00/25
- ユーザーフロー: Crok AI TBT 0.00/25

## 現状

TBT が 0.00 = メインスレッドがほぼ常時ブロックされている状態。

## 原因

1. **認証フロー**: フォーム入力中の React re-render が重い。30文字のユーザー名を 10ms 間隔で入力する際、各キーストロークで state 更新 + re-render が発生
2. **Crok フロー**: SSE ストリーミング中の DOM 更新が連続的に発生し、メインスレッドを占有

## 対応方針

1. **フォーム入力の最適化**: 認証モーダルのフォームコンポーネントを React.memo で最適化、不要な再レンダリングを防止
2. **Crok SSE の DOM 更新を requestAnimationFrame でバッチ化**: 毎チャンクごとの setState ではなく、RAF でまとめて更新
3. **MarkdownRenderer のレンダリング頻度を下げる**: SSE 受信中は plain text で表示し、完了後に Markdown レンダリング

## 関連ファイル

- `application/client/src/components/application/AuthModalPage.tsx`
- `application/client/src/containers/CrokContainer.tsx`
- `application/client/src/hooks/use_sse.ts`
- `application/client/src/components/foundation/MarkdownRenderer.tsx`

## 期待効果

各フロー TBT +10〜20点（合計 +20〜40点）
