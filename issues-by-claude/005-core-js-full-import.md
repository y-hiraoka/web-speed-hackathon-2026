# core-js と regenerator-runtime が全量インポートされている

## カテゴリ

ビルド / クライアント

## 影響するメトリクス

LCP / TBT

## 影響度

中

## 作業規模

S

## 問題の原因

webpack の entry に `"core-js"` と `"regenerator-runtime/runtime"` が全量インポートされている。core-js は全てのポリフィルを含むため、単体で数百KBのコードがバンドルに含まれる。

Chrome 最新版のみ対応であれば、ほぼ全てのポリフィルが不要。

## 原因箇所

`application/client/webpack.config.js:31-32`

```js
entry: {
  main: [
    "core-js",
    "regenerator-runtime/runtime",
    ...
  ]
}
```

## 解決方法

1. entry から `"core-js"` と `"regenerator-runtime/runtime"` を削除
2. Babel で `useBuiltIns: "usage"` に設定し、実際に使用されているポリフィルのみ自動注入する
3. あるいは Chrome 最新版ターゲットならポリフィル自体を不要にする

## 依存関係・注意点

- Babel の targets 変更（issue 004）と合わせて実施する
