# リソースのプリロード/プリコネクトが設定されていない

## カテゴリ

クライアント

## 影響するメトリクス

LCP / FCP

## 影響度

中

## 作業規模

S

## 問題の原因

`index.html` にリソースヒント（`<link rel="preload">`, `<link rel="preconnect">` 等）が一切設定されていない。

重要なリソースのダウンロードが遅延する：
- フォントファイル（12.6MB）
- CSS ファイル
- 初期 API リクエスト

## 原因箇所

`application/client/src/index.html` — リソースヒントの欠如

## 解決方法

1. フォントの preload を追加：
```html
<link rel="preload" href="/fonts/ReiNoAreMincho-Regular.woff2" as="font" type="font/woff2" crossorigin>
```
2. API のプリコネクトを追加（必要に応じて）
3. 重要な CSS/JS の preload を追加

## 依存関係・注意点

- フォントの最適化（issue 023）後にファイル名が変わる可能性がある
