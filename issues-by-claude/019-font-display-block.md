# カスタムフォントが font-display: block で読み込まれている

## カテゴリ

アセット / クライアント

## 影響するメトリクス

LCP / FCP / CLS

## 影響度

高

## 作業規模

S

## 問題の原因

`index.css` で2つの日本語カスタムフォント（合計約12.6MB）が `font-display: block` で読み込まれている。`block` はフォントのダウンロードが完了するまでテキストを非表示にするため、12.6MBのフォントファイルのダウンロードが完了するまでページ上のテキストが一切表示されない。

さらに、フォントは `.otf` (OpenType) 形式で提供されており、WOFF2 等の圧縮フォーマットに比べてファイルサイズが大きい。

## 原因箇所

`application/client/src/index.css:5-19`

```css
@font-face {
  font-family: "Rei no Are Mincho";
  font-display: block;
  src: url(/fonts/ReiNoAreMincho-Regular.otf) format("opentype");
  font-weight: normal;
}

@font-face {
  font-family: "Rei no Are Mincho";
  font-display: block;
  src: url(/fonts/ReiNoAreMincho-Heavy.otf) format("opentype");
  font-weight: bold;
}
```

## 解決方法

1. `font-display: block` を `font-display: swap` に変更（フォールバックフォントで即座に表示）
2. OTF を WOFF2 形式に変換（サイズ大幅削減）
3. 使用する文字のみサブセット化（日本語フォントは文字数が多いため効果大）
4. `<link rel="preload" as="font">` でフォントを先読み
5. フォントが必須でない場合、システムフォントにフォールバックも検討

## 依存関係・注意点

- VRT でフォントの表示が検証されている可能性があるため、フォント自体の削除はレギュレーション違反リスクがある
- フォーマット変更やサブセット化は問題ない
