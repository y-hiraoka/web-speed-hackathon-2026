# lodash が全量インポートされている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP / TBT

## 影響度

低

## 作業規模

S

## 問題の原因

`SoundWaveSVG.tsx` で `import _ from "lodash"` として lodash 全体（約 70KB minified）がインポートされている。使用されているのは `map`, `zip`, `mean`, `chunk`, `max` の5つのユーティリティのみ。

これらは全て ES ネイティブのメソッドで代替可能。

## 原因箇所

`application/client/src/components/foundation/SoundWaveSVG.tsx:1` (`import _ from "lodash"`)

## 解決方法

1. lodash を ES ネイティブメソッドで置き換え：
   - `_.map()` → `Array.prototype.map()`
   - `_.zip()` → 手動実装（数行）
   - `_.mean()` → `arr.reduce((a,b) => a+b, 0) / arr.length`
   - `_.chunk()` → 手動実装
   - `_.max()` → `Math.max(...arr)`
2. lodash を `package.json` から削除

## 依存関係・注意点

- 波形解析自体の最適化（issue 012）で全体的に書き直す場合は、その中で対応
