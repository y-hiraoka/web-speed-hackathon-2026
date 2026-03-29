# history ミドルウェアを先に挟み静的ファイルも一度 404 経由で遅延

## カテゴリ
サーバー

## 影響するメトリクス
TTFB / LCP

## 影響度
低

## 作業規模
S

## 問題の原因
`connect-history-api-fallback` を最初に適用しているため、静的ファイルリクエストも一度 history ミドルウェアを通過し、マッチしない場合に serveStatic へ回る。特に大量アセット読み込み時に無駄な判定が増え、TTFB がわずかに悪化する。

## 原因箇所
- [application/server/src/routes/static.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/static.ts#L13-L34)

## 解決方法
- 静的パス（/scripts,/styles,/images など）を先に serveStatic し、SPA ルーティングを最後に適用する。

## 依存関係・注意点
ルーティング順変更による 404 影響を確認する。
