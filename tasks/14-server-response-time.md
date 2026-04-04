# TASK-14: サーバーレスポンスタイムを短縮する（TTFB 最適化）

## 影響箇所

全ページの FCP, LCP, SI

## 現状

ssr.ts でページリクエストごとに:
1. HTML テンプレートファイルを `fs.readFile` で読み込む
2. `/api/v1/me` 相当の DB クエリを実行
3. ホームページでは posts の DB クエリも実行
4. `__INITIAL_DATA__` を注入して返す

## 原因

`readFile` は毎リクエストでディスク I/O が発生。DB クエリも毎回実行。

## 対応方針

1. **HTML テンプレートをサーバー起動時にメモリにキャッシュする**（fs.readFile を1回だけ）
2. **DB クエリを最適化**: Post のクエリに必要最小限の attributes を指定
3. **ETag/Last-Modified でブラウザキャッシュを活用**: API レスポンスに適切なキャッシュヘッダーを追加（既にあるが効果を確認）

## 関連ファイル

- `application/server/src/routes/ssr.ts`
- `application/server/src/routes/api/post.ts`

## 期待効果

TTFB を 50〜200ms 短縮、FCP/LCP に比例して改善
