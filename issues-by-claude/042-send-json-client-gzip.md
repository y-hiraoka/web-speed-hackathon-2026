# POST リクエストでクライアント側 gzip 圧縮を行っている

## カテゴリ

クライアント

## 影響するメトリクス

TBT

## 影響度

低

## 作業規模

S

## 問題の原因

`sendJSON` 関数で、POST リクエストの body を `pako` ライブラリで gzip 圧縮してから送信している。pako はバンドルサイズを増加させ（約 45KB minified）、圧縮処理もメインスレッドで実行される。

POST リクエストの body は一般的に小さい（認証情報、コメント文、DM メッセージ等）ため、クライアント側での圧縮はオーバーヘッドの方が大きい。

## 原因箇所

`application/client/src/utils/fetchers.ts:2` (`import { gzip } from "pako"`)
`application/client/src/utils/fetchers.ts:42-44` (gzip 圧縮処理)

## 解決方法

1. `sendJSON` から gzip 圧縮を削除し、通常の JSON を送信
2. `Content-Encoding: gzip` ヘッダーも削除
3. `pako` を `package.json` から削除

## 依存関係・注意点

- サーバー側で gzip 圧縮された body を受け取る処理がある場合、合わせて修正が必要
