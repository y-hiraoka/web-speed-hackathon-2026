# TASK-04: 利用規約ページの TBT を改善する

## 影響

利用規約 TBT 6.60/30

## 原因

利用規約ページは静的テキストのみで TBT がほぼ 0 になるはず。AppContainer の初期化処理（/api/v1/me fetch、Navigation レンダリング、useEffect でのスクロール等）がメインスレッドをブロックしている可能性。

## 対応方針

1. AppContainer の初期化処理を軽量化
2. /api/v1/me の fetch を startTransition 内で完全に非ブロッキングにする
3. Navigation コンポーネントの初期レンダリングコストを確認

## 関連ファイル

- `application/client/src/containers/AppContainer.tsx`
- `application/client/src/components/application/Navigation.tsx`

## 期待効果

TBT +15〜20点
