# アスペクト比計算が setTimeout 依存＋非パッシブ resize でレイアウト遅延

## カテゴリ
クライアント

## 影響するメトリクス
CLS / TBT

## 影響度
低

## 作業規模
S

## 問題の原因
`AspectRatioBox` は初期高さ計算を 500ms 遅延させ、`window.resize` を `passive: false` で監視している。初期レンダーで高さ 0 のまま表示され、後から reflow が発生して CLS が発生しやすい。また非パッシブリスナーでスクロール性能も落とす。

## 原因箇所
- [application/client/src/components/foundation/AspectRatioBox.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/foundation/AspectRatioBox.tsx#L16-L35)

## 解決方法
- `ResizeObserver` や CSS の `aspect-ratio` プロパティを使って即時に高さを決定する。
- `passive: true` でイベントを登録し、setTimeout 遅延を除去する。

## 依存関係・注意点
対応ブラウザ要件（Chrome 最新）では `aspect-ratio` が利用可能。
