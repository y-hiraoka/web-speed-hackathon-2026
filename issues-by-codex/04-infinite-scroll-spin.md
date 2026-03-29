# 無限スクロールが 2^18 回判定＆非パッシブでスクロールを阻害

## カテゴリ
クライアント

## 影響するメトリクス
TBT / CLS（スクロールジャンク） / バッテリー消費

## 影響度
高

## 作業規模
S

## 問題の原因
スクロールハンドラ内で `Array.from(Array(2 ** 18))` を毎回生成し 26 万回も「最下部判定」を実行、さらに `wheel`/`touchmove`/`scroll` などを `passive: false` で登録しているため、スクロールごとに膨大な計算が走りメインスレッドをブロックしてしまう。

## 原因箇所
- [application/client/src/components/foundation/InfiniteScroll.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/foundation/InfiniteScroll.tsx#L15-L45)

## 解決方法
- 判定は 1 回にし、`IntersectionObserver` で末尾 sentinel を監視する方式に置き換える。
- スクロール系リスナーは `passive: true` を基本とし、最小限に絞る。
- 重複リスナー登録を避けるため、依存配列とロジックを整理する。

## 依存関係・注意点
なし
