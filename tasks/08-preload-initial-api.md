# TASK-08: 初期 API リクエストを preload/prefetch して LCP を改善する

## 影響箇所

全ページの LCP, SI

## 現状

ページロードの流れ:
1. HTML ダウンロード
2. CSS + JS ダウンロード（並行）
3. JS 実行、React レンダリング開始
4. AppContainer が `/api/v1/me` を fetch
5. 各ページコンテナがデータを fetch（posts, post detail 等）
6. データ到着後にコンテンツ描画 → LCP

ステップ 4-5 の API fetch は JS 実行後にしか開始されないため、LCP が遅延する。

## 対応方針

1. **`<link rel="preload">` で API レスポンスを先読みする**
   - ssr.ts で HTML 生成時に、そのページに必要な API URL を `<link rel="preload" as="fetch" href="/api/v1/posts?limit=10&offset=0">` として挿入
   - `/api/v1/me` も preload する
2. **クライアント側でキャッシュを利用する**
   - preload された API レスポンスはブラウザキャッシュに入るため、fetch 時にキャッシュヒットする
   - `credentials: "same-origin"` と `crossorigin` 属性の一致に注意

## ページごとの preload 対象

- `/`: `/api/v1/posts?limit=10&offset=0`
- `/posts/:id`: `/api/v1/posts/:id`
- `/search`: なし（クエリ依存）
- `/terms`: なし（静的コンテンツ）
- `/dm`, `/dm/:id`: `/api/v1/dm` 系（認証必要）

## 関連ファイル

- `application/server/src/routes/ssr.ts`
- `application/client/src/hooks/use_fetch.ts`
- `application/client/src/hooks/use_infinite_fetch.ts`

## 期待効果

API レスポンスの待ち時間を JS 実行時間と並行化し、LCP を 0.5〜1.5s 短縮
