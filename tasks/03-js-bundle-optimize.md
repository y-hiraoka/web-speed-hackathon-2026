# TASK-03: JS バンドルサイズを削減して初期ロードを高速化

## 影響箇所

全ページの FCP, TBT, SI

## 現状のバンドルサイズ

- `vendor-react`: 218KB (gzip 70KB) - React + React DOM + React Router
- `vendor-markdown`: 238KB (gzip 73KB) - react-markdown, remark-gfm 等
- `vendor-katex`: 263KB (gzip 77KB) - KaTeX 数式レンダリング
- `index`: ~18KB (gzip 6KB) - エントリポイント

合計 gzip で約 226KB。Lighthouse シミュレーションでは数秒のダウンロード+パース時間になる。

## 対応方針

1. **vendor-markdown と vendor-katex を初期ロードから除外する**
   - MarkdownRenderer は `React.lazy()` で遅延ロード済みだが、manualChunks で分離したチャンクがプリロードされていないか確認
   - MarkdownRenderer を使う TimelineItem 内の Markdown 表示を、初期表示では plain text にして後からリッチ表示に切り替える
2. **react-syntax-highlighter を削除または軽量化**
   - refractor ベースの構文ハイライトは重い
   - 必要最小限の言語だけ含める
3. **Tree shaking の確認**
   - 未使用の export が残っていないか確認

## 関連ファイル

- `application/client/vite.config.ts`
- `application/client/src/components/foundation/MarkdownRenderer.tsx`
- `application/client/src/components/timeline/TimelineItem.tsx`
- `application/client/package.json`

## 期待効果

初期 JS ダウンロード量を 226KB → 80KB 程度に削減、FCP を 0.5〜1.0s 短縮
