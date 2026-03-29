# ビルド情報を window グローバルに埋め込み tree-shaking 不能な副作用を追加

## カテゴリ
ビルド / クライアント

## 影響するメトリクス
LCP / TBT（微小）

## 影響度
低

## 作業規模
S

## 問題の原因
`buildinfo.ts` で `window.__BUILD_INFO__` をグローバルに代入する副作用がエントリに含まれ、tree-shaking できず常にバンドルされる。加えて `EnvironmentPlugin` の値を実行時に参照するため定数畳み込みが効かない。

## 原因箇所
- [application/client/src/buildinfo.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/buildinfo.ts#L1-L17)
- [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L70-L83)

## 解決方法
- ビルド情報は `<meta>` や静的 JSON に出力し必要時のみフェッチする。
- エントリから分離し、必要な画面だけ動的 import する。

## 依存関係・注意点
スコアリングで要求されるため参照方法だけ変更する。
