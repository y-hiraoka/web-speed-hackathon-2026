# jQuery の同期 AJAX リクエストが UI をブロックしている

## カテゴリ

クライアント

## 影響するメトリクス

TBT / LCP / CLS

## 影響度

高

## 作業規模

M

## 問題の原因

全ての API 呼び出し (`fetchBinary`, `fetchJSON`, `sendFile`, `sendJSON`) で jQuery の `$.ajax()` が `async: false` で使用されている。同期 AJAX はメインスレッドを完全にブロックし、リクエスト中はユーザー操作もレンダリングも一切行えなくなる。

特にタイムラインの初期ロード時、各投稿の画像・動画・音声が全て同期的にダウンロードされるため、画面が長時間フリーズする。

## 原因箇所

`application/client/src/utils/fetchers.ts:4-13` (`fetchBinary` — `async: false`)
`application/client/src/utils/fetchers.ts:15-23` (`fetchJSON` — `async: false`)
`application/client/src/utils/fetchers.ts:25-38` (`sendFile` — `async: false`)
`application/client/src/utils/fetchers.ts:40-58` (`sendJSON` — `async: false`)

## 解決方法

jQuery を排除し、ネイティブの `fetch()` API に置き換える：

```typescript
export async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}
```

POSTリクエストも同様に `fetch()` で実装する。`sendJSON` で行っているクライアントサイドの gzip 圧縮（pako）も不要なので削除する。

## 依存関係・注意点

- jQuery 本体の削除（issue 007）と合わせて実施できる
- `jquery-binarytransport` も不要になる
- `pako` ライブラリも POST 用の gzip 圧縮にのみ使われているため削除可能
