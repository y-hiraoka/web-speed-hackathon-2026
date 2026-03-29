# 翻訳機能が巨大 LLM モデルをメインバンドルに抱え込み初回描画を阻害

## カテゴリ
クライアント / アセット

## 影響するメトリクス
LCP / TBT / TTI / 転送量

## 影響度
高

## 作業規模
M

## 問題の原因
タイムライン本文で常に読み込まれる `TranslatableText` が、巨大な `@mlc-ai/web-llm` と `gemma-2-2b` モデルを直接 import する `createTranslator` に依存している。Webpack で code splitting を無効化しているため、翻訳ボタンを押さなくても初回ロード時に LLM 実装が丸ごとバンドルされ、数十 MB の JS と重量級初期化が発生する。

## 原因箇所
- [application/client/src/components/post/TranslatableText.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/post/TranslatableText.tsx#L3-L76)
- [application/client/src/utils/create_translator.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/utils/create_translator.ts#L1-L60)
- [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L28-L136)（splitChunks 無効）

## 解決方法
- 翻訳機能をダイナミックインポートで遅延ロードし、必要時のみ別チャンクとして取得する。
- 可能ならサーバー側翻訳 API に切り出すか、軽量ライブラリへ置き換える。
- バンドルレベルでは splitChunks を有効化し、重い依存を共通チャンクに分離する。

## 依存関係・注意点
モデルサイズが非常に大きいので、ネットワーク帯域や端末スペックの低い環境での UX を特に確認する。
