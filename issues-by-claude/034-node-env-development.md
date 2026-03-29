# NODE_ENV=development でビルドされている

## カテゴリ

ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

中

## 作業規模

S

## 問題の原因

`package.json` のビルドスクリプトで `NODE_ENV=development webpack` が実行されている。また `EnvironmentPlugin` で `NODE_ENV` のデフォルト値も `"development"` に設定されている。

これにより：
1. React が開発モードで動作（追加の検証チェック、詳細なエラーメッセージ等でサイズ・速度が悪化）
2. `@babel/preset-react` の `development: true` により開発用のコンポーネント名情報が含まれる
3. 各ライブラリの開発用コードパスが有効化される

## 原因箇所

`application/client/package.json:8` (`"build": "NODE_ENV=development webpack"`)
`application/client/webpack.config.js:79` (`NODE_ENV: "development"`)
`application/client/babel.config.js:14` (`development: true`)

## 解決方法

1. ビルドスクリプトを `NODE_ENV=production webpack` に変更
2. `EnvironmentPlugin` の `NODE_ENV` デフォルト値を `"production"` に変更
3. `@babel/preset-react` の `development` を `false` に変更

## 依存関係・注意点

- webpack の `mode: "production"` 変更（issue 001）と合わせて実施
