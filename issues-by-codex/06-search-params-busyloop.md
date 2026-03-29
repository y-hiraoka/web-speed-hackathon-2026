# URL パラメータ監視が 1ms 周期の user-blocking タスクで常時回り続ける

## カテゴリ
クライアント

## 影響するメトリクス
TBT / CPU 使用率 / バッテリー

## 影響度
中

## 作業規模
S

## 問題の原因
`useSearchParams` が `scheduler.postTask(..., { priority: "user-blocking", delay: 1 })` を再帰的に呼び続け、ページ滞在中ずっと 1ms 間隔の高優先度タスクを生成している。URL が変わっていなくても永久に回り続け、アイドル時でもメインスレッドを占有する。

## 原因箇所
- [application/client/src/hooks/use_search_params.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/hooks/use_search_params.ts#L3-L27)

## 解決方法
- `useLocation` / `useSearchParams`（React Router のビルトイン）など履歴 API のイベントに乗り換え、ポーリングをやめる。
- どうしてもポーリングが必要なら `setInterval` で十分に長い間隔＋`requestIdleCallback` を使い、優先度を下げる。

## 依存関係・注意点
なし
