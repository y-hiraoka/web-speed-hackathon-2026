# Helmet による <title> 更新が全ページで二重実行され微小なオーバーヘッド

## カテゴリ
クライアント

## 影響するメトリクス
TBT（微小）

## 影響度
低

## 作業規模
S

## 問題の原因
`AppContainer` のローディング分岐と各ページコンポーネントで別々に `Helmet` を使い、ページ遷移時にタイトル設定が重複して実行される。小さいが余分なレンダーと DOM 更新が発生する。

## 原因箇所
- [application/client/src/containers/AppContainer.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/containers/AppContainer.tsx#L22-L70)
- 各ページコンポーネント内の `Helmet` 追加

## 解決方法
- ルートで一度だけデフォルトタイトルを設定し、ページは差分のみを設定するよう整理する。

## 依存関係・注意点
影響は小さいが軽量化の積み上げとして対応可能。
