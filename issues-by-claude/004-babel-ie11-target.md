# Babel のターゲットが IE 11 に設定されている

## カテゴリ

ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

中

## 作業規模

S

## 問題の原因

`babel.config.js` で `targets: "ie 11"` が設定されているため、最新のJavaScript構文が全てES5にトランスパイルされる。これにより：

1. `async/await` が regenerator-runtime を使ったステートマシンに変換される
2. Arrow functions、template literals、destructuring 等が全て変換される
3. 出力コードサイズが大幅に増加する
4. `modules: "commonjs"` によりESMのTree Shakingが効かない
5. `useBuiltIns: false` により core-js が全量インポートされている

## 原因箇所

`application/client/babel.config.js:5-10`

## 解決方法

1. `targets` を `"> 0.5%, last 2 versions, not dead"` や `"defaults"` に変更（レギュレーション上 Chrome 最新版のみ対応すれば良いので `"last 1 Chrome version"` でも可）
2. `modules` を `false` に変更（ESM を維持し webpack の Tree Shaking を有効化）
3. `useBuiltIns` を `"usage"` に変更し、必要なポリフィルのみ含める
4. エントリポイントから `core-js` と `regenerator-runtime/runtime` の全量インポートを削除

## 依存関係・注意点

- `core-js` の全量インポート削除と合わせて行う（issue 005 参照）
- `@babel/preset-react` の `development: true` も `false` に変更すべき（不要な開発用チェックが含まれる）
