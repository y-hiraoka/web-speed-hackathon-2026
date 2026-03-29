# 不要な依存ライブラリが含まれている

## カテゴリ

クライアント / ビルド

## 影響するメトリクス

LCP

## 影響度

低

## 作業規模

S

## 問題の原因

以下の依存ライブラリがインストールされているが、用途が限定的またはネイティブ API で代替可能：

- `encoding-japanese` — 日本語エンコーディング変換（TextEncoder/TextDecoder で代替可能な場合が多い）
- `classnames` — CSS クラス名結合（テンプレートリテラルで代替可能）
- `common-tags` — テンプレートリテラルユーティリティ（翻訳機能の `stripIndents` のみで使用）
- `fast-average-color` — 画像の平均色取得
- `langs` — 言語コード変換（翻訳機能のみで使用）
- `tiny-invariant` — アサーションユーティリティ
- `json-repair-js` — JSON 修復（翻訳機能のみで使用）

## 原因箇所

`application/client/package.json` — 各依存ライブラリ

## 解決方法

各ライブラリの使用箇所を確認し、不要なものを削除、またはネイティブ API で代替する。

## 依存関係・注意点

- 翻訳機能の変更（issue 031）で `common-tags`, `langs`, `json-repair-js` は不要になる可能性が高い
