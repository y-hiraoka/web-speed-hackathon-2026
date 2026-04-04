# TASK-04: 動画投稿フローのタイムアウトを修正する

## 影響箇所

ユーザーフロー: 投稿（50点）

## 現状

"動画投稿の完了を確認できませんでした" で計測不能（0点）

## 原因候補

スコアリングツールは .mkv ファイルをアップロード後、120秒以内に `<article>` 内の `button[name="動画プレイヤー"]` の出現を待つ。

1. **ffmpeg の .mkv → .mp4 変換が遅い**: movie.ts の `execFileAsync("ffmpeg", ...)` にタイムアウト設定がない。MKV のデコードは MP4 より遅く、120秒を超える可能性
2. **ffmpeg が失敗している**: MKV コンテナの互換性問題で変換エラー
3. **投稿後の reload で動画が表示されない**: Post API が movieId を含まないレスポンスを返している

## スコアリングツールの期待動作

1. "投稿する" ボタン → "新規投稿" ダイアログ
2. テキスト入力 + "動画を添付" で .mkv ファイル添付
3. "投稿する" クリック（120秒タイムアウト）
4. `article` に テキスト "動画を添付したテスト投稿です。" が出現
5. `article` に `button[name="動画プレイヤー"]` が出現

## 対応方針

1. ffmpeg コマンドに `-preset ultrafast` を使用して変換速度を最優先にする
2. `execFileAsync` にタイムアウト(60秒)と maxBuffer を設定
3. エラー時のレスポンスを適切に返す
4. 動画の出力解像度を下げる（480→360 等）

## 関連ファイル

- `application/server/src/routes/api/movie.ts`
- `application/server/src/routes/api/post.ts`
- `application/client/src/components/foundation/PausableMovie.tsx`

## 期待効果

投稿フロー計測可能に → +50点
