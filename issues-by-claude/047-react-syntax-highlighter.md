# react-syntax-highlighter が初期バンドルに含まれている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

低

## 作業規模

S

## 問題の原因

`react-syntax-highlighter` は全言語のハイライト定義を含む大きなライブラリ（約 100KB+ minified）。Crok のコードブロック表示でのみ使用されるが、初期バンドルに含まれる。

## 原因箇所

`application/client/src/components/crok/CodeBlock.tsx:2-3`

```tsx
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
```

## 解決方法

1. Crok ページ全体を `React.lazy()` で遅延ロード（issue 003）
2. 軽量な代替ライブラリ（`prism-react-renderer` 等）への置き換え
3. `react-syntax-highlighter/dist/esm/light` ビルドを使い、必要な言語のみインポート

## 依存関係・注意点

- コード分割（issue 003）で Crok ページが遅延ロードされれば自動的に分離される
