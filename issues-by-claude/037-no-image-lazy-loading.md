# 画像に loading="lazy" が設定されていない

## カテゴリ

クライアント

## 影響するメトリクス

LCP / TBT

## 影響度

中

## 作業規模

S

## 問題の原因

タイムライン上の全画像（投稿画像、プロフィール画像）に `loading="lazy"` が設定されていない。画面外の画像も全て即座にダウンロードが開始されるため、初期ロードのネットワーク帯域を圧迫し、LCP に影響する画像のダウンロードが遅延する。

なお、現状は `CoveredImage` でバイナリダウンロードしているため `<img>` の `loading` 属性は機能しないが、バイナリダウンロードの修正（issue 011）後に効果を発揮する。

## 原因箇所

`application/client/src/components/foundation/CoveredImage.tsx:58-68` (img タグ)
`application/client/src/components/post/PostItem.tsx:26` (プロフィール画像)
`application/client/src/components/direct_message/DirectMessagePage.tsx:100` (プロフィール画像)

## 解決方法

1. ファーストビュー以外の `<img>` に `loading="lazy"` を追加
2. ファーストビューの画像（最初の数投稿のプロフィール画像等）は `loading="eager"` のまま

## 依存関係・注意点

- CoveredImage のバイナリダウンロード修正（issue 011）の後に効果が出る
