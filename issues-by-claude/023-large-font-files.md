# カスタムフォントが 12.6MB の OTF 形式で未最適化

## カテゴリ

アセット

## 影響するメトリクス

LCP / FCP

## 影響度

高

## 作業規模

M

## 問題の原因

2つの日本語カスタムフォント（ReiNoAreMincho-Regular.otf: 6.3MB, ReiNoAreMincho-Heavy.otf: 6.3MB）が OTF 形式のまま配信されている。

問題点：
1. OTF 形式は圧縮されておらず、WOFF2 に変換すると 30-50% サイズ削減可能
2. 日本語フォントは数千文字を含むが、実際に使用される文字は限られている
3. サブセット化されていない
4. プリロードされていない

## 原因箇所

`application/public/fonts/ReiNoAreMincho-Regular.otf` (6.3MB)
`application/public/fonts/ReiNoAreMincho-Heavy.otf` (6.3MB)

## 解決方法

1. WOFF2 形式に変換（`woff2_compress` や `fonttools` を使用）
2. 使用する文字のみサブセット化（`pyftsubset` を使用）
   - 実際に seed データで使われている文字 + 基本的な記号・句読点に限定
3. `<link rel="preload" as="font" type="font/woff2" crossorigin>` を追加
4. `font-display: swap` に変更（issue 019 参照）

## 依存関係・注意点

- font-display の修正（issue 019）と合わせて実施
- VRT でフォントの表示が検証されるため、フォント自体は維持する必要がある
