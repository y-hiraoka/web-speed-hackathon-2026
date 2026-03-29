# Node.js の Buffer ポリフィルがブラウザバンドルに含まれている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP

## 影響度

低

## 作業規模

S

## 問題の原因

webpack の `ProvidePlugin` で `Buffer` (Node.js のバッファ実装) がグローバルに注入されている。これは `image-size` と `piexifjs` がクライアント側で使用する Buffer に依存しているため。

`buffer` パッケージ（約 20KB）がバンドルに含まれる。

## 原因箇所

`application/client/webpack.config.js:74` (`Buffer: ["buffer", "Buffer"]`)
`application/client/src/components/foundation/CoveredImage.tsx:28,32` (`Buffer.from(data)`)

## 解決方法

1. `image-size` と `piexifjs` のクライアント側使用を廃止（issue 011）
2. Buffer ポリフィルを削除
3. `ProvidePlugin` から `Buffer` エントリを削除
4. `buffer` を `package.json` から削除

## 依存関係・注意点

- 画像バイナリ処理の修正（issue 011）と合わせて実施
