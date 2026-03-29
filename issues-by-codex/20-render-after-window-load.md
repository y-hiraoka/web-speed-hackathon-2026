# 初回レンダーを window load 待ちにして LCP を遅延させている

## カテゴリ
クライアント

## 影響するメトリクス
LCP / TTI

## 影響度
高

## 作業規模
S

## 問題の原因
アプリのマウントを `window.addEventListener("load", ...)` 内で行っており、全アセット読み込み完了まで React の描画が始まらない。バンドルやフォント・画像が重いため、LCP が大きく遅延する。

## 原因箇所
- [application/client/src/index.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/index.tsx#L6-L13)

## 解決方法
- 即時実行で `createRoot` を呼び、必要なら `DOMContentLoaded` に留める。
- クリティカル CSS/JS を優先読み込みし、非同期アセットは遅延読込にする。

## 依存関係・注意点
なし
