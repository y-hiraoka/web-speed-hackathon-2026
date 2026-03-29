# GIF 再生を全バイナリ取得＋CPU デコードで行いメインスレッドを圧迫

## カテゴリ
クライアント

## 影響するメトリクス
TBT / メモリ使用量 / 転送量

## 影響度
中

## 作業規模
M

## 問題の原因
`PausableMovie` は GIF を `fetchBinary`（同期 Ajax）で全量取得し、`omggif/gifler` で JavaScript デコードして `<canvas>` に描画している。ブラウザのネイティブデコーダを使わないため CPU・メモリ消費が大きく、再生前に全フレーム読み込みが必要で開始も遅い。

## 原因箇所
- [application/client/src/components/foundation/PausableMovie.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/foundation/PausableMovie.tsx#L19-L88)
- [application/client/src/utils/fetchers.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/utils/fetchers.ts#L4-L12)

## 解決方法
- `<video>`/`<img>` に任せるか、MP4/WEBM へサーバー側で変換しストリーミング再生する。
- どうしても GIF を扱う場合は `createImageBitmap` や Web Worker でデコードをオフロードする。

## 依存関係・注意点
動画フォーマット変更時はフロントの再生コンポーネントも更新が必要。
