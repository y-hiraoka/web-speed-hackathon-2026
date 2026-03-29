# moment / lodash 全量 / core-js を無条件バンドルしサイズ・実行コストが増大

## カテゴリ
クライアント / ビルド

## 影響するメトリクス
LCP / TBT / 転送量

## 影響度
中

## 作業規模
S

## 問題の原因
`moment`（約 300KB）と `lodash` をサブモジュール import せずフルバンドルで使用し、`core-js` と `regenerator-runtime` を常にエントリに入れている。ターゲットブラウザがモダンにも関わらずポリフィルを全量読み込むため、初期 JS サイズと実行コストが無駄に増えている。

## 原因箇所
- エントリ指定: [application/client/webpack.config.js](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/webpack.config.js#L30-L37)
- 依存ライブラリ: [application/client/package.json](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/package.json#L17-L53)
- 利用例: [application/client/src/components/timeline/TimelineItem.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/timeline/TimelineItem.tsx#L1-L16)

## 解決方法
- `moment` は `dayjs` などの軽量代替に置き換えるか、必要なロケールだけに絞る。
- `lodash` は ESM モジュール単位 import か標準 API に置換する。
- ビルドターゲットをモダンブラウザに設定し、`core-js` を必要なポリフィルのみに限定する。

## 依存関係・注意点
ライブラリ置き換え後のフォーマットやユーティリティの挙動差異に注意。
