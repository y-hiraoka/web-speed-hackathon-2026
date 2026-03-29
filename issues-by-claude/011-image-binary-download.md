# 画像をバイナリダウンロードしてクライアント側でサイズ・EXIF解析している

## カテゴリ

クライアント

## 影響するメトリクス

LCP / TBT / CLS

## 影響度

高

## 作業規模

M

## 問題の原因

`CoveredImage` コンポーネントで、画像を `<img>` タグの `src` に URL を直接設定する代わりに：

1. `fetchBinary` で画像全体を ArrayBuffer としてダウンロード（同期AJAX）
2. `image-size` ライブラリでバイナリからサイズを解析
3. `piexifjs` で EXIF データからalt テキストを抽出
4. `URL.createObjectURL()` で Blob URL を生成して `<img>` に設定

これにより画像1枚あたり：メインスレッドブロック + バイナリのメモリコピー + EXIF パース + Blob URL 生成が発生。タイムラインに複数画像がある場合、全てが直列・同期的に処理される。

## 原因箇所

`application/client/src/components/foundation/CoveredImage.tsx:25-39`

## 解決方法

1. 画像の alt テキストは API レスポンスに含める（サーバー側でEXIFから抽出してDBに保存）
2. 画像サイズは API レスポンスに含めるか、CSS の `object-fit: cover` で対応
3. `<img>` タグの `src` に直接 URL を設定
4. `image-size`, `piexifjs` ライブラリをクライアントから削除
5. Blob URL の代わりに直接パスを使用

## 依存関係・注意点

- サーバー側の API レスポンスに alt テキストフィールドの追加が必要
- seed データに alt 情報を含める必要がある場合はシード変更が必要
- `fetchBinary` の同期AJAX修正（issue 006）と合わせて実施
