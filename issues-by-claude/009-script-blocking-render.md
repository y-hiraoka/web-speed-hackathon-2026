# script タグが head 内で同期的に読み込まれレンダリングをブロックしている

## カテゴリ

クライアント

## 影響するメトリクス

LCP / FCP / TBT

## 影響度

高

## 作業規模

S

## 問題の原因

`index.html` の `<head>` 内で `<script src="/scripts/main.js"></script>` が `defer` や `async` 属性なしで読み込まれている。これにより：

1. HTML パーサーがスクリプトのダウンロードとパースが完了するまで完全にブロックされる
2. DOM の構築が遅延する
3. 巨大なバンドル（ミニファイなし + inline source map で数MB以上）のダウンロード完了まで何も表示されない

さらに、`index.tsx` で `window.addEventListener("load", ...)` を使ってReactのマウントを行っているため、全リソースの読み込み完了まで何も表示されない。

## 原因箇所

`application/client/src/index.html:7` (`<script src="/scripts/main.js"></script>`)
`application/client/src/index.tsx:8` (`window.addEventListener("load", ...)`)

## 解決方法

1. `<script>` タグに `defer` 属性を追加：`<script defer src="/scripts/main.js"></script>`
2. `window.addEventListener("load", ...)` を削除し、直接 `createRoot().render()` を呼び出す（`defer` により DOM は準備完了済み）
3. 可能であれば `<script>` タグを `<body>` の末尾に移動

## 依存関係・注意点

- HtmlWebpackPlugin で `inject: false` が設定されているため、手動でテンプレートを修正する必要がある

## Vite 移行による解消見込み (issue 000)

**Vite に移行することで自然に解消される見込み。** Vite は `<script type="module" src="...">` を生成し、`type="module"` は仕様上自動的に `defer` と同等の非同期読み込みとなる。HTML パーサーをブロックせず、DOM 構築と並行してスクリプトがダウンロードされる。`index.html` は Vite のエントリポイントとして書き直すため、`window.addEventListener("load", ...)` も同時に修正する。

→ Vite 移行後に、生成された HTML の script タグが `type="module"` であること、レンダリングブロックが発生していないことを確認するタスク。
