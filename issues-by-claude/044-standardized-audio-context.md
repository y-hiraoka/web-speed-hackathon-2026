# standardized-audio-context ポリフィルが不要に含まれている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP

## 影響度

低

## 作業規模

S

## 問題の原因

`standardized-audio-context` がインストールされ、webpack の `ProvidePlugin` でグローバルに `AudioContext` を上書きしている。Chrome 最新版のみサポートすればよいため、標準の `AudioContext` が使用可能であり、ポリフィルは不要。

## 原因箇所

`application/client/webpack.config.js:73` (`AudioContext: ["standardized-audio-context", "AudioContext"]`)
`application/client/package.json` (`standardized-audio-context` 依存)

## 解決方法

1. `ProvidePlugin` から `AudioContext` のエントリを削除
2. `standardized-audio-context` を `package.json` から削除
3. 使用箇所があれば `new AudioContext()` を直接使用

## 依存関係・注意点

- ProvidePlugin の修正（issue 033）と合わせて実施
