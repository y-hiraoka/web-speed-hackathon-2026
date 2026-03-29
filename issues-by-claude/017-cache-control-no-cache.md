# Cache-Control ヘッダーがキャッシュを無効化している

## カテゴリ

サーバー

## 影響するメトリクス

LCP / TTFB

## 影響度

高

## 作業規模

S

## 問題の原因

全レスポンスに `Cache-Control: max-age=0, no-transform` と `Connection: close` が設定されている。

- `max-age=0` — ブラウザキャッシュが即座に無効化され、毎回サーバーにリクエストが飛ぶ
- `Connection: close` — HTTP keep-alive が無効化され、毎回 TCP コネクションが張り直される

静的アセット（JS、CSS、画像、フォント）もキャッシュされないため、ページ遷移のたびに全リソースを再ダウンロードする。

## 原因箇所

`application/server/src/app.ts:16-21`

```typescript
app.use((_req, res, next) => {
  res.header({
    "Cache-Control": "max-age=0, no-transform",
    Connection: "close",
  });
  return next();
});
```

## 解決方法

1. このミドルウェアを削除
2. 静的アセットには長期キャッシュを設定：
   - JS/CSS（contenthash 付き）: `Cache-Control: public, max-age=31536000, immutable`
   - 画像/フォント: `Cache-Control: public, max-age=86400` 以上
3. API レスポンスには適切なキャッシュ戦略を設定（`no-cache` または短い `max-age`）
4. `Connection: close` を削除して keep-alive を有効化

## 依存関係・注意点

- 静的ファイルの serve-static でも `etag: false`, `lastModified: false` が設定されている（issue 018 参照）
