# TASK-02: 投稿フローの失敗を修正する

## 影響

ユーザーフロー: 投稿（50点）が計測不能

## エラー

"投稿モーダルの表示に失敗しました"

## 原因

スコアリングツールは `getByRole("dialog", { name: "新規投稿" })` でダイアログを検出する。NavigationItem の commandfor + showModal() によるモーダル表示が機能していない可能性。NewPostModalContainer が lazy load で、ボタンクリック時にまだマウントされていないか、dialog 要素の id/aria-labelledby の不一致がある。

## 対応方針

1. NewPostModalContainer の lazy load タイミングを確認
2. dialog 要素の id と aria-labelledby が正しく設定されているか確認
3. NavigationItem の showModal() 呼び出しが正しく動作するか確認

## 関連ファイル

- `application/client/src/containers/NewPostModalContainer.tsx`
- `application/client/src/containers/AppContainer.tsx`
- `application/client/src/components/application/NavigationItem.tsx`
- `application/client/src/components/foundation/Modal.tsx`

## 期待効果

+50点
