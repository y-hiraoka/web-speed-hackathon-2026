# TASK-05: 写真つき投稿詳細ページの LCP を改善する

## 影響

写真つき投稿詳細 LCP 4.50/25

## 原因

PostItem.tsx で ImageArea に loading/fetchPriority を渡していないため、画像が lazy loading になっている。投稿詳細ページの画像は LCP 要素なので eager loading にすべき。

## 対応方針

PostItem.tsx の ImageArea に `loading="eager"` と `fetchPriority="high"` を追加する。

## 関連ファイル

- `application/client/src/components/post/PostItem.tsx`

## 期待効果

LCP +10〜15点
