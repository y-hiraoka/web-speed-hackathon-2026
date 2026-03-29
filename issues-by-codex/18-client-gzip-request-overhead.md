# クライアントが JSON を gzip して送信するがサーバー非対応でCPUだけ浪費

## カテゴリ
クライアント / サーバー

## 影響するメトリクス
TBT / TTFB / CPU

## 影響度
低

## 作業規模
S

## 問題の原因
`sendJSON` が小さな JSON を毎回 `pako.gzip` で圧縮し `Content-Encoding: gzip` を付けて送信している。一方サーバー側は `bodyParser.json` で gzip を展開せず、実質意味のない圧縮に CPU 時間を費やしている（場合によっては不正ボディ扱いになる）。

## 原因箇所
- クライアント送信: [application/client/src/utils/fetchers.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/utils/fetchers.ts#L40-L56)
- サーバー受信: [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts#L12-L15)（gzip 展開処理なし）

## 解決方法
- 通常の JSON を `fetch` で送るシンプルな実装に戻す。圧縮が必要ならサーバーに解凍処理を導入する。
- 送信サイズが大きい場合のみ条件付きで圧縮し、ヘッダーとパーサーを整合させる。

## 依存関係・注意点
圧縮を外した際の API 互換性を確認。sendFile など他の送信系も合わせて整理する。
