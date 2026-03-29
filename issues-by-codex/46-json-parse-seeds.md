# seed 挿入で JSONL を行毎同期パースし大規模データで CPU スパイク

## カテゴリ
サーバー / ツール

## 影響するメトリクス
初期化時間 / CPU

## 影響度
低

## 作業規模
S

## 問題の原因
シード挿入処理は `readJsonlFileBatched` で行単位に `JSON.parse` しており、I/O とパースがシングルスレッドに集中する。データ量が多いと初期化が遅く、ベンチ開始までの待ち時間が伸びる。

## 原因箇所
- [application/server/src/seeds.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/seeds.ts#L20-L93)

## 解決方法
- バイナリ形式や圧縮済みシードに切り替え、ストリーミングデコードや Worker を使う。
- もしくは DB にプリロードしたスナップショットをそのままマウントする方式に変更する。

## 依存関係・注意点
ベンチ時に初期化を頻繁に呼ぶ場合に効果が出る。
