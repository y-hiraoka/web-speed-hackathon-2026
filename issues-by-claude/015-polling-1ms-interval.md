# 1ms 間隔のポーリングでメインスレッドが占有されている

## カテゴリ

クライアント

## 影響するメトリクス

TBT

## 影響度

中

## 作業規模

S

## 問題の原因

2つのカスタムフックで `scheduler.postTask()` を `delay: 1` (1ms) で再帰的に呼び出し、継続的にポーリングしている：

1. `useHasContentBelow` — コンテンツ末尾の位置を監視するために getBoundingClientRect() を1msごとに呼び出し
2. `useSearchParams` — URL のクエリパラメータの変更を1msごとにポーリング

また、`DirectMessagePage` では `setInterval(() => {...}, 1)` で1msごとに `window.getComputedStyle(document.body).height` を取得してスクロール位置を更新している。

これらはいずれもメインスレッドを常時占有し、TBT を大幅に悪化させる。

## 原因箇所

`application/client/src/hooks/use_has_content_below.ts:27-28`
`application/client/src/hooks/use_search_params.ts:19`
`application/client/src/components/direct_message/DirectMessagePage.tsx:77-86`

## 解決方法

1. `useHasContentBelow` → `IntersectionObserver` を使用
2. `useSearchParams` → React Router の `useSearchParams` フックを使用、または `popstate` イベントをリッスン
3. `DirectMessagePage` のスクロール監視 → `MutationObserver` または `ResizeObserver` を使用、あるいはメッセージ追加時にのみスクロール

## 依存関係・注意点

なし
