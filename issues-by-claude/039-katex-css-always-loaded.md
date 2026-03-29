# KaTeX CSS が常に読み込まれている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP

## 影響度

低

## 作業規模

S

## 問題の原因

`ChatMessage.tsx` で `import "katex/dist/katex.min.css"` がトップレベルでインポートされている。KaTeX の CSS（約 20KB + フォント群）は Crok ページでのみ必要だが、コード分割がないため初期バンドルに含まれる。

さらに `CopyWebpackPlugin` で KaTeX のフォントファイル（約40ファイル）が `dist/styles/fonts/` にコピーされている。

## 原因箇所

`application/client/src/components/crok/ChatMessage.tsx:1` (`import "katex/dist/katex.min.css"`)
`application/client/webpack.config.js:86-92` (KaTeX フォントコピー)

## 解決方法

1. Crok ページを `React.lazy()` で遅延ロード（issue 003 のコード分割と合わせて）
2. KaTeX CSS は Crok ページのチャンクに含める
3. KaTeX フォントはCDNから読み込むか、必要なフォントのみコピー

## 依存関係・注意点

- コード分割（issue 003）と合わせて実施
