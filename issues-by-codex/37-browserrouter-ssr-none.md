# SPA 専用構成で SSR/SSG が無く LCP が遅い

## カテゴリ
クライアント / サーバー

## 影響するメトリクス
LCP / TTFB

## 影響度
中

## 作業規模
L

## 問題の原因
`BrowserRouter` による完全クライアントレンダリングで、初回は空 HTML + 重い JS を取得してから描画するため LCP が遅い。サーバーは静的ファイル配信のみで SSR/SSG を行っていない。

## 原因箇所
- [application/client/src/index.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/index.tsx#L6-L13)
- [application/server/src/routes/static.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/static.ts#L13-L35)

## 解決方法
- React サーバーコンポーネントや SSR/SSG を導入し、初期 HTML をサーバーで生成する。
- もしくは静的生成した HTML を配信し、クライアントは hydration のみ行う。

## 依存関係・注意点
大掛かりな改修だが LCP 改善効果が大きい。VRT への影響確認が必要。
