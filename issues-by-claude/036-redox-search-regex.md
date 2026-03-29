# 検索クエリパーサーに ReDoS 脆弱性のある正規表現が使われている

## カテゴリ

クライアント

## 影響するメトリクス

TBT

## 影響度

低

## 作業規模

S

## 問題の原因

クライアント側の検索クエリパーサー (`search/services.ts`) で、バックトラッキングが発生しやすい正規表現が使用されている：

```typescript
const sincePattern = /since:((\d|\d\d|\d\d\d\d-\d\d-\d\d)+)+$/;
const untilPattern = /until:((\d|\d\d|\d\d\d\d-\d\d-\d\d)+)+$/;
```

また `isValidDate` 関数でも：
```typescript
const slowDateLike = /^(\d+)+-(\d+)+-(\d+)+$/;
```

`(\d+)+` のようなネストした量指定子は、特定の入力で指数的なバックトラッキングを引き起こし、メインスレッドを長時間ブロックする。

## 原因箇所

`application/client/src/search/services.ts:13-14` (sincePattern, untilPattern)
`application/client/src/search/services.ts:41` (slowDateLike)

## 解決方法

正規表現を安全なパターンに書き換え：

```typescript
const sincePattern = /since:(\d{4}-\d{2}-\d{2})$/;
const untilPattern = /until:(\d{4}-\d{2}-\d{2})$/;
const slowDateLike = /^\d+-\d+-\d+$/;
```

## 依存関係・注意点

なし
