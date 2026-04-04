# TASK-13: KaTeX CSS の遅延読み込みで初期 CSS サイズを削減

## 影響箇所

全ページの FCP

## 現状

`vendor-katex-*.css`（28.77KB, gzip 7.91KB）が全ページで読み込まれているが、KaTeX は Crok AI チャットの Markdown レンダリングでのみ使用される。

## 原因

MarkdownRenderer が `import "katex/dist/katex.min.css"` を含んでおり、Vite が CSS を別チャンクに分離してはいるが、`index.html` の `<link>` タグとして全ページで読み込まれる。

## 対応方針

1. **KaTeX CSS を動的 import に変更**: MarkdownRenderer 内で `import()` を使って CSS を遅延読み込み
2. **または `<link rel="preload" as="style">` + media query trick で非同期化**
3. **MarkdownRenderer が使われるまで CSS を読み込まない**ようにする

## 関連ファイル

- `application/client/src/components/foundation/MarkdownRenderer.tsx`
- `application/client/vite.config.ts`

## 期待効果

初期 CSS サイズ -8KB (gzip)、FCP 0.1〜0.3s 改善
