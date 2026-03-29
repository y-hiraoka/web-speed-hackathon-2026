# 検索クエリ空でも fetch を走らせエラー→再試行で無駄なトラフィック

## カテゴリ
クライアント / API

## 影響するメトリクス
TTFB / ネットワーク転送 / TBT（エラー処理）

## 影響度
低

## 作業規模
S

## 問題の原因
`SearchContainer` でクエリが空文字の場合も `useInfiniteFetch` に空文字の `apiPath` を渡すため、`fetchJSON("")` が実行され失敗する。エラーでリトライや余計な状態更新が発生し、無駄なリクエストと再レンダーを誘発する。

## 原因箇所
- [application/client/src/containers/SearchContainer.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/containers/SearchContainer.tsx#L13-L23)
- [application/client/src/hooks/use_infinite_fetch.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/hooks/use_infinite_fetch.ts#L12-L78)

## 解決方法
- クエリが空なら `useInfiniteFetch` を呼ばず早期 return する。
- あるいは `fetcher` 内で空パスをスキップし、リクエストを発行しない。

## 依存関係・注意点
挙動変更後の検索フォーム UI を確認する。
