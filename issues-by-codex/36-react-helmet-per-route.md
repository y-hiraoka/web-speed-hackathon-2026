# ルーティング毎に HelmetProvider を再生成しオーバーヘッドが大きい

## カテゴリ
クライアント

## 影響するメトリクス
TBT / メモリ

## 影響度
低

## 作業規模
S

## 問題の原因
`AppContainer` 内でルート全体を囲う `HelmetProvider` とページごとの `Helmet` があり、AppContainer 自体が再レンダーするたびに Provider が再生成される。head 管理のためのコンテキスト計算が都度発生し、特にタイムラインスクロール時の再描画コストになる。

## 原因箇所
- [application/client/src/containers/AppContainer.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/containers/AppContainer.tsx#L17-L73)

## 解決方法
- ルート全体を単一の `HelmetProvider` でラップし、不要な再生成を避ける。
- ページ固有のタイトルだけ個別 `Helmet` を維持する。

## 依存関係・注意点
効果は小さいが軽量化の積み上げに有効。
