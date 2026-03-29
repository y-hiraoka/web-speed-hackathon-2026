# useInfiniteFetch が毎回全データを取得してクライアント側でスライスしている

## カテゴリ

クライアント

## 影響するメトリクス

TTFB / TBT / LCP

## 影響度

高

## 作業規模

M

## 問題の原因

`useInfiniteFetch` フックは、ページネーションの `fetchMore` が呼ばれるたびに API から**全データ**を取得し、クライアント側で `allData.slice(offset, offset + LIMIT)` してページング処理している。

つまり、スクロールするたびに全件（例：3,000件の投稿データ）がサーバーから転送される。
2ページ目のロード時も、3ページ目のロード時も、毎回3,000件分の全データがダウンロードされる。

## 原因箇所

`application/client/src/hooks/use_infinite_fetch.ts:39-43`

```tsx
void fetcher(apiPath).then((allData) => {
  setResult((cur) => ({
    ...cur,
    data: [...cur.data, ...allData.slice(offset, offset + LIMIT)],
    ...
  }));
});
```

## 解決方法

1. API リクエストに `limit` と `offset` パラメータを付与して、必要なデータのみ取得：
```tsx
fetcher(`${apiPath}?limit=${LIMIT}&offset=${offset}`)
```
2. サーバー側の API がページネーションパラメータを受け付けることを確認（既に対応済み）

## 依存関係・注意点

- サーバー側の API エンドポイント (`/posts`, `/posts/:postId/comments` 等) は既に `limit` / `offset` パラメータに対応している
