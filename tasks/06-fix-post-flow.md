# TASK-06: 投稿ユーザーフローを修正する

## 影響

計測不能 → 最大 50点獲得可能

## エラー

"投稿の完了を確認できませんでした"

## 原因候補

- 投稿後に `/posts/{postId}` にナビゲートするが、スコアリングツールはタイムライン上の `<article>` を待っている
- 音声投稿で「シャイニングスター」「魔王魂」のテキスト表示が遅い or 欠落
- 動画投稿で「動画プレイヤー」ボタンの表示が遅い or 欠落

## スコアリングツールの期待動作

1. テキスト投稿 → article にテキストが表示される
2. 画像投稿（.tiff）→ article に alt テキスト付き画像が表示
3. 動画投稿（.mkv）→ article に「動画プレイヤー」ボタンが表示
4. 音声投稿（.wav）→ article に「シャイニングスター」「魔王魂」テキストが表示

## 対応方針

投稿後のナビゲーション先を確認、各メディアタイプの投稿→表示フローを検証。

## 関連ファイル

- `application/client/src/containers/NewPostModalContainer.tsx`
- `application/server/src/routes/api/post.ts`
- `application/server/src/routes/api/image.ts`
- `application/server/src/routes/api/movie.ts`
- `application/server/src/routes/api/sound.ts`
- `application/client/src/components/post/PostItem.tsx`

## 期待効果

+50点（計測可能になった場合）
