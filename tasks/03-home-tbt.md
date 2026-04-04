# TASK-03: ホームページの TBT を改善する

## 影響

ホーム TBT 3.00/30

## 原因

10件のポストの初期レンダリングが重い。各ポストの TranslatableText コンポーネントが useState + useCallback を使用し、初期レンダリング時にオーバーヘッドが発生。

## 対応方針

1. 初期取得件数をさらに削減（10→5件）
2. TranslatableText を軽量化（初期表示時は単純な span + button にし、クリック時のみ state を持つ）
3. Timeline の above-fold 分割を見直し

## 関連ファイル

- `application/client/src/components/post/TranslatableText.tsx`
- `application/client/src/components/timeline/Timeline.tsx`
- `application/client/src/hooks/use_infinite_fetch.ts`
- `application/server/src/routes/api/post.ts`

## 期待効果

TBT +15〜25点
