# jQuery が不要に依存されている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

中

## 作業規模

S

## 問題の原因

React アプリケーションで jQuery (87KB minified) が AJAX リクエストのためだけに使用されている。さらに webpack の `ProvidePlugin` でグローバルに `$` と `window.jQuery` が注入され、`jquery-binarytransport` も entry に含まれている。

ネイティブの `fetch()` API で完全に代替可能。

## 原因箇所

`application/client/webpack.config.js:70-71` (`ProvidePlugin` で jQuery をグローバル注入)
`application/client/webpack.config.js:33` (`jquery-binarytransport` を entry に含む)
`application/client/src/utils/fetchers.ts:1` (`import $ from "jquery"`)

## 解決方法

1. `fetchers.ts` を `fetch()` API で書き直す
2. webpack entry から `jquery-binarytransport` を削除
3. `ProvidePlugin` から `$` と `window.jQuery` を削除
4. `package.json` から `jquery` と `jquery-binarytransport` を削除

## 依存関係・注意点

- 同期 AJAX の修正（issue 006）と同時に実施する
