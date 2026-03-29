# GIF 動画ファイルが巨大で非効率なフォーマット

## カテゴリ

アセット

## 影響するメトリクス

LCP / TTFB

## 影響度

高

## 作業規模

M

## 問題の原因

`public/movies/` 内の15個の GIF ファイルが合計約 179MB。個別ファイルも 5-25MB と非常に大きい。
全て 1080x1080 の高解像度 GIF であり、GIF フォーマットは動画に対して極めて非効率：
- 256色しか使えない
- 圧縮効率が悪い
- MP4/WebM の10-20倍のファイルサイズになる

## 原因箇所

`application/public/movies/` — 15個のGIFファイル（合計約179MB）

## 解決方法

1. GIF を MP4（H.264）または WebM（VP9）に変換
   - ffmpeg を使用: `ffmpeg -i input.gif -c:v libx264 -pix_fmt yuv420p output.mp4`
   - 期待サイズ: 179MB → 10-20MB程度
2. 解像度を表示サイズに合わせて縮小（例: 540x540 や 360x360）
3. クライアント側を `<video>` タグでの再生に変更（issue 013 参照）
4. `<video>` に `preload="none"` または `preload="metadata"` を設定

## 依存関係・注意点

- GIF → 動画変換後、クライアント側の再生コンポーネントも変更が必要（issue 013）
- ループ再生は `<video loop>` で対応可能
- VRT で動画の見た目が検証される可能性あり
