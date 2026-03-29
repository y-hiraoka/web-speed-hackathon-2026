# 300MB超の画像・動画・音声を無圧縮でそのまま配信

## カテゴリ
アセット

## 影響するメトリクス
LCP / TTFB / 転送量 / バンド幅

## 影響度
高

## 作業規模
M

## 問題の原因
`application/public` 配下に画像 89MB、動画 179MB、音声 66MB など大容量ファイルが多数含まれているが、圧縮やリサイズ、モダンフォーマット変換が行われていない。キャッシュも無効化されているため、初回アクセスやキャッシュミス時に極端な転送量が発生する。

## 原因箇所
- 実ファイル: `/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/public/{images,movies,sounds}/`
- キャッシュ設定無効化: [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts#L16-L21)

## 解決方法
- 画像は WebP/AVIF への一括変換とリサイズ、音声はビットレートダウン、動画は GIF→MP4/H.264 など適切なコーデックに変換する。
- ファイル名に contenthash を付け、長期キャッシュを有効化する。
- 不要なデモアセットは削減し、CDN も検討する。

## 依存関係・注意点
VRT で使われるアセットは品質差異が出ないよう慎重に変換する。
