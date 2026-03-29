# ProvidePlugin で不要なグローバル変数が注入されている

## カテゴリ

ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

低

## 作業規模

S

## 問題の原因

webpack の `ProvidePlugin` で以下のグローバル変数が全モジュールに注入されている：

- `$` / `window.jQuery` — jQuery（fetch API で代替可能）
- `AudioContext` — `standardized-audio-context` による AudioContext ポリフィル
- `Buffer` — Node.js の Buffer ポリフィル

これにより各ライブラリが使用有無に関わらずバンドルに含まれる可能性がある。

## 原因箇所

`application/client/webpack.config.js:70-75`

## 解決方法

1. jQuery 削除後は `$` と `window.jQuery` を削除（issue 007）
2. `AudioContext` は Chrome 最新版であれば標準の AudioContext を使用可能 — `standardized-audio-context` は不要
3. `Buffer` は `image-size` と `piexifjs` で使用されているが、これらを削除すれば不要（issue 011）
4. 使用箇所がなくなった時点で ProvidePlugin 自体を削除

## 依存関係・注意点

- jQuery 削除（issue 007）、画像処理の最適化（issue 011）と合わせて実施

## Vite 移行による解消見込み (issue 000)

**Vite に移行することで自然に解消される見込み。** Vite には Webpack の `ProvidePlugin` に相当する機能がないため、jQuery (`$`, `window.jQuery`)、`AudioContext`（standardized-audio-context）、`Buffer` のグローバル注入は自動的に廃止される。ただし、これらのグローバル変数に依存しているコードの修正が別途必要（jQuery → fetch API、AudioContext → ネイティブ API、Buffer → 使用箇所の廃止）。

→ Vite 移行後に、グローバル変数 `$`, `jQuery`, `Buffer` への参照でランタイムエラーが発生していないことを確認するタスク。
