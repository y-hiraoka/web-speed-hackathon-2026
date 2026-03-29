# redux-form が不要に使われている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

低

## 作業規模

S

## 問題の原因

認証モーダルのフォーム管理に `redux-form` (約 26KB minified) が使用されている。redux-form はメンテナンスが終了しており、Redux Store に依存する重量級のフォームライブラリ。

認証フォームは単純な username/password の2フィールドのみであり、React の `useState` で十分に管理可能。

## 原因箇所

`application/client/package.json` (`redux-form` 依存)
`application/client/src/store/` (Redux Store 設定)

## 解決方法

1. `redux-form` を React の `useState` に置き換え
2. Redux Store が redux-form のためだけに存在する場合、Redux 自体も削除可能
3. `redux`, `react-redux`, `redux-form` を `package.json` から削除

## 依存関係・注意点

- Redux Store の他の使用箇所を確認する
