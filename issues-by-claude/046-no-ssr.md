# Server Side Rendering (SSR) が実装されていない

## カテゴリ

クライアント / サーバー

## 影響するメトリクス

LCP / FCP / TTFB / CLS

## 影響度

高

## 作業規模

L

## 問題の原因

アプリケーションは完全な Client Side Rendering (CSR) SPA であり、以下のフローでページが表示される：

1. HTML をダウンロード（空の `<div id="app">` のみ）
2. JS バンドルをダウンロード・パース・実行
3. React がマウントされ、API リクエストを発行
4. API レスポンスを受信してからコンテンツをレンダリング

SSR を実装すれば、サーバー側でHTMLを生成してクライアントに送信できるため、FCP/LCP が大幅に改善される。

## 原因箇所

`application/client/src/index.tsx` — `createRoot()` による CSR マウント
`application/client/src/index.html` — 空の HTML テンプレート

## 解決方法

1. React の `renderToString()` / `renderToPipeableStream()` を使った SSR を実装
2. サーバー側で Express のリクエストハンドラ内で React コンポーネントを HTML にレンダリング
3. クライアント側で `hydrateRoot()` を使ってハイドレーション
4. データフェッチをサーバー側で行い、初期データを HTML に埋め込む

## 依存関係・注意点

- 作業規模が大きいため、他の最適化を先に行う方が効率的な場合がある
- React Router のサーバーサイドルーティング対応が必要
- データフェッチの二重実行防止（サーバーで取得したデータをクライアントに引き継ぐ）
