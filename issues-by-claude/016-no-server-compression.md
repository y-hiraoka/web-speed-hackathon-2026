# サーバーでレスポンス圧縮が行われていない

## カテゴリ

サーバー

## 影響するメトリクス

LCP / TTFB

## 影響度

高

## 作業規模

S

## 問題の原因

Express サーバーに `compression` ミドルウェアが設定されておらず、全てのレスポンス（HTML、JS、CSS、JSON API）が非圧縮で送信される。

巨大なバンドルファイル（数MB）や大量のJSON（全投稿データ等）が非圧縮で転送されるため、ネットワーク帯域を大量に消費する。

## 原因箇所

`application/server/src/app.ts` — compression ミドルウェアが存在しない

## 解決方法

1. `compression` パッケージをインストール
2. Express ミドルウェアとして追加：
```typescript
import compression from "compression";
app.use(compression());
```
3. 静的ファイルについては事前に gzip/brotli 圧縮済みファイルを生成しておくことも有効

## 依存関係・注意点

なし
