# TASK-09: ホームページの LCP 0.00 を修正する

## 影響箇所

ホームページ LCP（25点満点中 0.00点）

## 現状

ホームページだけ LCP が 0.00。他のページは 1.25 なのにホームだけ 0。

## 原因候補

1. **LCP 要素が特定できない**: タイムラインのポスト一覧がレンダリングされる際、個々のポストが小さく、Lighthouse が「最大コンテンツ」を検出できない可能性
2. **画像が lazy loading**: `loading="lazy"` が設定されているため、ビューポート内の画像も LCP 候補から外れている可能性
3. **LCP 要素の描画がタイムアウト**: Lighthouse が LCP の安定化を待つ間に新しい要素が追加され続けている（InfiniteScroll の影響）

## 対応方針

1. **ファーストビューの画像から `loading="lazy"` を外す**: 最初のポストのプロフィール画像を `loading="eager"` にして LCP 候補にする
2. **ファーストビューに大きなテキスト要素を確保する**: ページヘッダーやメインの見出しを追加
3. **InfiniteScroll の初期レンダリングタイミングを調整**: 初期データのレンダリング完了後に IntersectionObserver を設定

## 関連ファイル

- `application/client/src/containers/TimelineContainer.tsx`
- `application/client/src/components/timeline/TimelineItem.tsx`
- `application/client/src/components/foundation/InfiniteScroll.tsx`
- `application/client/src/components/foundation/CoveredImage.tsx`

## 期待効果

LCP: 0.00 → 5.00以上（+5点以上）
