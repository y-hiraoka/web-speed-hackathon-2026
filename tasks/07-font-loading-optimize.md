# TASK-07: フォント読み込みを最適化して FCP を改善する

## 影響箇所

全ページの FCP, LCP（特に利用規約ページ）

## 現状

- 2つのカスタムフォント（ReiNoAreMincho Regular/Heavy）を `<link rel="preload">` で読み込み
- `font-display: swap` を設定済み
- フォントファイルサイズ: 各約 300KB（woff2）

## 原因

preload はフォントのダウンロードを早めるが、CSS が外部ファイルの場合、CSS のダウンロード完了までフォント適用が遅延する。利用規約ページは ReiNoAreMincho フォントに依存しており、フォント切り替え時に CLS やリペイントが発生。

## 対応方針

1. **フォントサブセット化**: 利用規約ページで使用する文字だけを含むサブセットフォントを生成し、ファイルサイズを大幅削減
2. **フォント宣言を HTML にインライン化**: `@font-face` ルールを `<style>` タグで `<head>` に直接記述し、CSS ファイルのダウンロード待ちを解消
3. **preconnect の追加**: フォントが同一オリジンの場合は不要だが確認する

## 関連ファイル

- `application/client/index.html`
- `application/client/src/index.css`
- `application/public/fonts/`

## 期待効果

FCP を 0.2〜0.5s 短縮、利用規約 LCP 改善
