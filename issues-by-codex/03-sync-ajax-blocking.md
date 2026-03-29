# すべての API 呼び出しが同期 Ajax でメインスレッドを占有

## カテゴリ
クライアント

## 影響するメトリクス
TBT / TTI / FID / LCP（データ取得待ちでレンダリング停滞）

## 影響度
高

## 作業規模
S

## 問題の原因
`fetchJSON` / `sendJSON` / `sendFile` / `fetchBinary` が jQuery の `$.ajax` に `async: false` を指定しており、ネットワーク待ちの間メインスレッドが完全にブロックされる。スクロールや入力が一切処理されず、描画も止まるため体感が極端に悪化する。

## 原因箇所
- [application/client/src/utils/fetchers.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/utils/fetchers.ts#L4-L57)

## 解決方法
- `async: false` を削除し `fetch` か `$.ajax` のデフォルト非同期呼び出しに置き換える。
- Promise ベースの API にし、呼び出し側でローディング状態を管理する。
- 可能なら `pako` での gzip も必要時のみ行い、送信コストと圧縮時間を抑える。

## 依存関係・注意点
同期 XHR はブラウザ仕様上非推奨で、将来削除予定。早急に置き換えても互換性リスクは低い。
