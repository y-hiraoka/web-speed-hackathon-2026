# ffmpeg・ImageMagick WASM をエントリで読み込みバンドルサイズ激増

## カテゴリ
クライアント / アセット

## 影響するメトリクス
LCP / TBT / 転送量

## 影響度
高

## 作業規模
M

## 問題の原因
新規投稿モーダルで使う `convertImage` / `convertMovie` / `convertSound` をトップレベル import しており、`@ffmpeg/ffmpeg` の UMD + WASM と `@imagemagick/magick-wasm` がメインバンドルに含まれる。`splitChunks` 無効のため初回ロードで数十 MB を読み込むが、投稿しないユーザーにも強制される。

## 原因箇所
- [application/client/src/components/new_post_modal/NewPostModalPage.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/new_post_modal/NewPostModalPage.tsx#L1-L118)
- [application/client/src/utils/load_ffmpeg.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/utils/load_ffmpeg.ts#L1-L15)
- [application/client/src/utils/convert_image.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/utils/convert_image.ts#L1-L34)
- [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L130-L136)

## 解決方法
- 投稿モーダルをコード分割し、開いたときにだけ動的 import で WASM 群を読み込む。
- 可能ならサーバーサイド変換に寄せ、クライアントはプレビュー用の軽量処理に限定する。
- `splitChunks`/`cacheGroups` でメディア変換ライブラリを別チャンクに隔離する。

## 依存関係・注意点
WASM の CORS/`crossOrigin` 取り扱いに注意。遅延ロード後の UX を確認。
