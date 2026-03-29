# 画像・動画の遅延読み込み指定がなく折返し外リソースを即座に取得

## カテゴリ
クライアント / アセット

## 影響するメトリクス
LCP / TTFB / 転送量 / CLS

## 影響度
中

## 作業規模
S

## 問題の原因
タイムラインやプロフィール画像などすべての `<img>` に `loading=\"lazy\"` や明示的な `width/height` が付いておらず、折り返し外のメディアも初回に一斉ダウンロードされる。プレースホルダ高さも無いため画像ロード時にレイアウトがずれ、CLS を悪化させる。

## 原因箇所
- 例: [application/client/src/components/timeline/TimelineItem.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/timeline/TimelineItem.tsx#L33-L70)

## 解決方法
- 画像/動画には `loading=\"lazy\"` と寸法（またはアスペクト比ボックス）を指定する。
- 低解像度プレビューや `srcset`/`sizes` でビューポートに応じたサイズを配信する。

## 依存関係・注意点
なし
