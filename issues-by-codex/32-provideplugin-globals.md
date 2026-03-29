# jQuery/Buffer/AudioContext を全体に Provide して不要なコードを常駐させている

## カテゴリ
ビルド / クライアント

## 影響するメトリクス
LCP / 転送量 / TBT

## 影響度
低

## 作業規模
S

## 問題の原因
Webpack の `ProvidePlugin` で `$`・`window.jQuery`・`Buffer`・`AudioContext` をグローバル注入しているため、使用しないページでもこれらのポリフィル/モジュールがバンドルに必ず含まれる。tree shaking も効かず、JS サイズと初期化コストが増大する。

## 原因箇所
- [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L70-L75)

## 解決方法
- 必要箇所での明示 import に切り替え、グローバル Provide を廃止する。
- 代替として Vite 等へ移行し、自動ポリフィルを使わず軽量化する。

## 依存関係・注意点
既存コードがグローバル依存していないか確認しつつ段階的に置換する。
