# Tailwind CSS がブラウザ実行時にコンパイルされている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP / TBT / FCP / CLS

## 影響度

高

## 作業規模

M

## 問題の原因

`index.html` で `@tailwindcss/browser` がCDN経由でランタイムに読み込まれ、174行の `<style type="text/tailwindcss">` ブロックがブラウザ上でコンパイルされている。

これにより：
1. CDN からの追加ダウンロード（~100KB）
2. ブラウザ上での CSS コンパイル処理（TBT増加）
3. コンパイル完了までスタイルが適用されず FOUC (Flash of Unstyled Content) が発生（CLS増加）

## 原因箇所

`application/client/src/index.html:9` (`<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.2.1">`)
`application/client/src/index.html:10-174` (`<style type="text/tailwindcss">` ブロック)

## 解決方法

1. Tailwind CSS v4 のビルドツール（`@tailwindcss/postcss` または `@tailwindcss/vite`）をインストール
2. `postcss.config.js` に Tailwind プラグインを追加
3. `<style type="text/tailwindcss">` ブロックの内容を CSS ファイルに移動
4. `index.html` から CDN スクリプトと `<style>` ブロックを削除
5. ビルド時に CSS を生成する

## 依存関係・注意点

- Tailwind v4 は PostCSS プラグインとして使用可能
- カスタムテーマ変数 (`@theme`) や `@utility` の移行が必要
