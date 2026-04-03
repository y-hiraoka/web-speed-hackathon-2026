# TASK-04: ホームページの TBT を改善する

## 影響

TBT が 1.50/30（修正前も 1.80/30 で元々低い）

## 原因

タイムラインの初期レンダリングが重い。30件のポストを一度にレンダリングしており、メインスレッドをブロックしている可能性。

## 対応方針

- 初期表示件数を減らす（例: 10件 → スクロールで追加読み込み）
- ポストレンダリングの最適化（不要な再レンダリング防止、React.memo 活用）
- 重いコンポーネント（MarkdownRenderer 等）の遅延レンダリング
- requestIdleCallback や startTransition での分割レンダリング

## 関連ファイル

- `application/client/src/containers/TimelineContainer.tsx`
- `application/client/src/components/timeline/TimelineItem.tsx`
- `application/client/src/hooks/use_infinite_fetch.ts`
- `application/server/src/routes/api/post.ts`

## 期待効果

TBT +15〜25点
