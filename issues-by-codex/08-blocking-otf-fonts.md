# 13MB 超の OTF フォントを font-display:block で配信し初期描画が白抜け

## カテゴリ
アセット

## 影響するメトリクス
LCP / CLS

## 影響度
中

## 作業規模
S

## 問題の原因
`Rei no Are Mincho` の OTF を `font-display: block` で読み込み、しかもキャッシュ無効ヘッダーで毎回 13MB 以上のフォント（`application/public/fonts`）を取得している。フォント読み込み完了までテキストが描画されず、初回表示が大きく遅れる。

## 原因箇所
- [application/client/src/index.css](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/index.css#L5-L19)
- [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts#L16-L21)（キャッシュ無効化設定）

## 解決方法
- `font-display: swap` か `optional` に変更し、プレロードが必要なら `<link rel="preload">` を併用する。
- WOFF2 など軽量フォーマットへ変換しサイズを削減する。
- 静的キャッシュを有効化して再取得を防ぐ。

## 依存関係・注意点
レギュレーション上デザイン差異が許容される範囲でフォント最適化を行う。VRT への影響に注意。
