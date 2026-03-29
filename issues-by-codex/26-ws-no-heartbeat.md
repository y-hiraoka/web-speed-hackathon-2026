# WebSocket にハートビートがなく接続が溜まりサーバー資源を消費

## カテゴリ
サーバー / クライアント

## 影響するメトリクス
メモリ使用量 / スループット / TTFB（資源枯渇時）

## 影響度
低

## 作業規模
S

## 問題の原因
DM 用 WebSocket は ping/pong や再接続バックオフがなく、ネットワーク切断後もサーバー側にリスナーが残留する。多数クライアントが開くと EventEmitter にハンドラが蓄積しメモリを圧迫する。

## 原因箇所
- サーバー側: [application/server/src/routes/api/direct_message.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/direct_message.ts#L64-L151)
- クライアント側: [application/client/src/hooks/use_ws.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/hooks/use_ws.ts#L3-L16)

## 解決方法
- 一定間隔で ping/pong を送り、切断を検知したらクリーンアップする。
- クライアントは再接続時に旧接続を確実に close し、サーバーも `close`/`error` でリスナーを解除する。

## 依存関係・注意点
WS 実装の変更は e2e を要確認。
