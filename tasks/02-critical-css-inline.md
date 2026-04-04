# TASK-02: Critical CSS をインライン化してレンダリングブロッキングを解消

## 影響箇所

全ページの FCP, LCP, SI

## 現状

CSS は外部ファイルとして配信されている（`index-*.css`, `vendor-katex-*.css`）。ブラウザは外部 CSS のダウンロード完了まで描画をブロックする。

## 原因

Vite のデフォルトビルドでは CSS を外部ファイルとして出力する。Lighthouse のシミュレーテッドスロットリングでは、この外部 CSS のダウンロードが FCP を遅延させる。

## 対応方針

1. **初期表示に必要な最小限の CSS を `<style>` タグとして `<head>` にインライン化する**
   - ナビゲーション、レイアウト、フォント宣言など
   - Tailwind のリセット CSS を含む
2. **KaTeX CSS は遅延読み込みにする**（MarkdownRenderer でのみ使用、初期表示に不要）
3. **残りの CSS は `<link rel="preload" as="style">` + onload で非同期化**

## 関連ファイル

- `application/client/index.html`
- `application/client/src/index.css`
- `application/client/src/tailwind.css`
- `application/client/vite.config.ts`
- `application/server/src/routes/ssr.ts`

## 期待効果

FCP を 0.3〜0.5s 短縮（各ページ +1〜2点）
