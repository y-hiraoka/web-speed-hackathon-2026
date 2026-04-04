# TASK-07: 検索ページの LCP を改善する

## 影響

検索ページ LCP 10.50/25

## 原因

検索ページの LCP 要素は検索結果のテキストまたは見出し。初期表示時に検索結果がないため、LCP 候補が検索フォームのみになっている可能性。SSR で検索フォームの HTML を生成していない。

## 対応方針

1. SSR で検索ページのフォーム HTML を生成する（テキスト入力 + 検索ボタン）
2. 検索フォームを大きな LCP 候補にする

## 関連ファイル

- `application/server/src/routes/ssr.ts`
- `application/client/src/containers/SearchContainer.tsx`
- `application/client/src/components/search/SearchPage.tsx`

## 期待効果

LCP +5〜10点
