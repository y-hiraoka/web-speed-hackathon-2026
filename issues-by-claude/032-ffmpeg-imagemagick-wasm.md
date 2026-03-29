# FFmpeg/ImageMagick WASM がバンドルに含まれている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

中

## 作業規模

S

## 問題の原因

ファイルアップロード機能に `@ffmpeg/ffmpeg` + `@ffmpeg/core` (FFmpeg WASM) と `@imagemagick/magick-wasm` (ImageMagick WASM) が使用されている。

これらは投稿作成時のメディアアップロードでのみ使用されるが、初期バンドルに含まれる。WASM ファイルは数十MBのサイズがある。

## 原因箇所

`application/client/webpack.config.js:103-122` (alias で WASM ファイルを解決)
`application/client/package.json` (依存関係)

## 解決方法

1. `import()` による遅延ロードでアップロード時のみ読み込む
2. メディア変換をサーバーサイドに移行（サーバーで ffmpeg を実行）
3. そもそも変換が不要な場合は WASM を削除

## 依存関係・注意点

- コード分割（issue 003）と合わせて実施
- アップロード機能がどの程度使われるかによって優先度が変わる
