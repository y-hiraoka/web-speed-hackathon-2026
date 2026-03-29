# 音声ファイルをバイナリダウンロードして波形解析している

## カテゴリ

クライアント

## 影響するメトリクス

TBT / LCP

## 影響度

中

## 作業規模

M

## 問題の原因

`SoundPlayer` コンポーネントで音声ファイル全体を `fetchBinary` で ArrayBuffer としてダウンロードし、`SoundWaveSVG` コンポーネントで `AudioContext.decodeAudioData()` を使って音声をデコードした上で波形データを計算している。

`SoundWaveSVG` では lodash の `map`, `zip`, `mean`, `chunk`, `max` を使って左右チャンネルの全サンプルデータ（数百万サンプル）を処理し、100個のピーク値を算出している。これはメインスレッドで実行され、音声ファイルごとに数秒のブロッキングが発生する。

## 原因箇所

`application/client/src/components/foundation/SoundPlayer.tsx:15` (`fetchBinary` で音声全体をダウンロード)
`application/client/src/components/foundation/SoundWaveSVG.tsx:9-28` (`calculate` 関数)

## 解決方法

1. 音声は `<audio>` タグの `src` に直接 URL を設定（バイナリダウンロード不要）
2. 波形データはサーバー側で事前計算して API レスポンスに含める
3. または波形表示を簡易化（静的な波形アイコンにする等）
4. lodash の個別メソッドインポートは不要（ES ネイティブメソッドで代替可能）

## 依存関係・注意点

- 波形表示がVRTに含まれている場合、サーバー側で事前計算したデータを使う必要がある
- `fetchBinary` の修正（issue 006）と関連
