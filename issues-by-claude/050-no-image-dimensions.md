# img タグに width/height が設定されず CLS が発生する

## カテゴリ

クライアント

## 影響するメトリクス

CLS

## 影響度

中

## 作業規模

S

## 問題の原因

`CoveredImage` や `PostItem` 内の `<img>` タグに `width` / `height` 属性が設定されていない。画像のダウンロード完了まで要素のサイズが確定せず、ロード後にレイアウトシフトが発生する。

現状の `CoveredImage` はバイナリダウンロード後に `image-size` でサイズを取得しているが、ロード完了までは `null` を返すため何も表示されない（これ自体が CLS の原因）。

## 原因箇所

`application/client/src/components/foundation/CoveredImage.tsx:49-51` (isLoading 時に null を返す)
`application/client/src/components/post/PostItem.tsx:26` (プロフィール画像に width/height なし)

## 解決方法

1. API レスポンスに画像の width/height を含める
2. `<img>` タグに `width` と `height` を明示的に設定
3. CSS の `aspect-ratio` を使ってプレースホルダーを表示
4. ロード中のスケルトン表示を追加

## 依存関係・注意点

- サーバー側 API の変更が必要
- 画像バイナリ処理の修正（issue 011）と合わせて実施
