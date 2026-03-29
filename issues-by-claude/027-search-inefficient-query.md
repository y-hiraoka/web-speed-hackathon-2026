# 検索APIが2つのクエリを実行しメモリ上でマージしている

## カテゴリ

サーバー / DB

## 影響するメトリクス

TTFB

## 影響度

中

## 作業規模

S

## 問題の原因

`/search` エンドポイントで：

1. テキスト検索用のクエリ（LIKE）を実行
2. ユーザー名/名前検索用の別クエリを実行
3. 2つの結果をメモリ上でマージ・重複排除・ソート・再スライス

さらにページネーションが二重に適用されている：
- 各クエリに `limit`/`offset` を適用
- マージ後にも `offset`/`limit` で再スライス

結果として正しいページネーションにならず、必要以上のデータを取得している。

## 原因箇所

`application/server/src/routes/api/search.ts:41-91`

## 解決方法

1. 2つのクエリを1つの SQL に統合（OR 条件を使用）：
```typescript
const posts = await Post.findAll({
  include: [{
    association: "user",
    where: searchTerm ? {
      [Op.or]: [
        { username: { [Op.like]: searchTerm } },
        { name: { [Op.like]: searchTerm } },
      ],
    } : undefined,
    required: !!searchTerm && !textWhere,
  }],
  where: {
    [Op.or]: [
      textWhere,
      // user match handled by include
    ].filter(Boolean),
    ...dateWhere,
  },
  limit,
  offset,
  order: [["createdAt", "DESC"]],
});
```
2. メモリ上のマージ・ソート・スライスを削除

## 依存関係・注意点

- テキスト検索に LIKE を使用しているため、SQLite の FTS (Full Text Search) の導入も検討可能
