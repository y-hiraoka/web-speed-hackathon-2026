# InfiniteScroll で 262,144 要素の配列を毎スクロールイベントで生成している

## カテゴリ

クライアント

## 影響するメトリクス

TBT / CLS

## 影響度

高

## 作業規模

S

## 問題の原因

`InfiniteScroll` コンポーネントのスクロールハンドラ内で、最下部到達判定のために `2^18 = 262,144` 要素の配列を生成し、同じ判定を262,144回繰り返している。コメントには「念の為 2の18乗回」とあるが、1回の判定で十分。

さらにこのハンドラは `wheel`, `touchmove`, `resize`, `scroll` の4つのイベント全てに登録され、いずれも `passive: false` で登録されているため、スクロールパフォーマンスにも悪影響を与える。

## 原因箇所

`application/client/src/components/foundation/InfiniteScroll.tsx:17-19`

```tsx
const hasReached = Array.from(Array(2 ** 18), () => {
  return window.innerHeight + Math.ceil(window.scrollY) >= document.body.offsetHeight;
}).every(Boolean);
```

## 解決方法

1. 配列生成を削除し、単純な判定に変更：
```tsx
const hasReached = window.innerHeight + Math.ceil(window.scrollY) >= document.body.offsetHeight;
```
2. スクロールイベントリスナーを `passive: true` に変更
3. `wheel` と `touchmove` のリスナーは不要なので削除（`scroll` イベントのみで十分）
4. 理想的には `IntersectionObserver` を使用する

## 依存関係・注意点

なし
