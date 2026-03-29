# 波形描画のために毎回 AudioContext で全音声デコードし CPU を消費

## カテゴリ
クライアント

## 影響するメトリクス
TBT / メモリ使用量

## 影響度
中

## 作業規模
S

## 問題の原因
`SoundWaveSVG` は表示のたびに `AudioContext` を生成し、音声全体を `decodeAudioData` でデコード・配列操作して波形を計算している。キャッシュやワーカーオフロードがなく、リスト表示で複数音声があるとメインスレッドが連続して重い処理を行う。

## 原因箇所
- [application/client/src/components/foundation/SoundWaveSVG.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/foundation/SoundWaveSVG.tsx#L9-L64)

## 解決方法
- サーバー側で波形サマリを前計算して JSON/画像で提供する。
- クライアント側は Web Worker でオフロードし、結果をキャッシュする。
- `AudioContext` の再利用とデコード結果のメモ化で同一データの再計算を避ける。

## 依存関係・注意点
音声ファイルの長さに比例して計算時間が伸びる点に留意。
