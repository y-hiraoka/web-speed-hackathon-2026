# react-helmet による不要な head 管理オーバーヘッド

## カテゴリ

クライアント

## 影響するメトリクス

TBT

## 影響度

低

## 作業規模

S

## 問題の原因

`react-helmet` (`@dr.pogodin/react-helmet`) がインストールされている。SPA のページタイトル管理等に使用される可能性があるが、document.title の直接設定や `useEffect` で十分に代替可能。

## 原因箇所

`application/client/package.json` (`react-helmet` 依存)

## 解決方法

1. `react-helmet` の使用箇所を確認し、必要であれば React の標準機能で代替
2. 軽量な代替として `document.title` を直接設定
3. ライブラリを削除してバンドルサイズを削減

## 依存関係・注意点

なし
