# moment.js が使用されている（大きくて非推奨）

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

中

## 作業規模

S

## 問題の原因

日付フォーマットに `moment.js` (約 70KB minified + locale データ) が使用されている。moment.js はメンテナンスモードであり、全 locale データがバンドルに含まれるとさらに大きくなる。

使用箇所では `format("LL")`, `format("HH:mm")`, `toISOString()`, `locale("ja")` 程度の単純なフォーマットのみ。

## 原因箇所

`application/client/src/components/post/PostItem.tsx:1` (`import moment from "moment"`)
`application/client/src/components/direct_message/DirectMessagePage.tsx:2` (`import moment from "moment"`)

## 解決方法

1. `Intl.DateTimeFormat` (ネイティブ API) で代替：
```typescript
new Intl.DateTimeFormat("ja", { year: "numeric", month: "long", day: "numeric" }).format(date)
```
2. または軽量ライブラリ `dayjs` (2KB) に置き換え
3. `moment` を `package.json` から削除

## 依存関係・注意点

なし
