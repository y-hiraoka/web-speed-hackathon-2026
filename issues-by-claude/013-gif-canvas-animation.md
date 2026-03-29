# GIF をバイナリダウンロードして Canvas でフレーム描画している

## カテゴリ

クライアント

## 影響するメトリクス

TBT / LCP

## 影響度

中

## 作業規模

M

## 問題の原因

`PausableMovie` コンポーネントで GIF ファイル全体を `fetchBinary` で ArrayBuffer としてダウンロードし、`omggif` の `GifReader` で全フレームをデコードし、`gifler` の `Animator` で Canvas にフレームごとに描画している。

GIF ファイルは最大 25MB あり、全フレームのデコードがメインスレッドで実行される。
そもそも GIF は動画フォーマットとして非効率であり、MP4/WebM に変換すべき。

## 原因箇所

`application/client/src/components/foundation/PausableMovie.tsx:19` (`fetchBinary`)
`application/client/src/components/foundation/PausableMovie.tsx:31-45` (GIF デコード + Canvas 描画)

## 解決方法

1. GIF を MP4 または WebM に変換（アセット最適化 issue 020 参照）
2. `<video>` タグで直接再生（`src` に URL を設定）
3. 一時停止/再生は `video.pause()` / `video.play()` で制御
4. `gifler`, `omggif` ライブラリを削除

## 依存関係・注意点

- GIF → 動画変換はアセット最適化（issue 020）と一緒に実施
- 一時停止時の表示がVRTに影響する可能性があるため確認が必要
