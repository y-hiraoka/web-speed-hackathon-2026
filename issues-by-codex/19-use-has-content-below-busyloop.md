# スクロール位置監視が 1ms 間隔で永久ループしメインスレッドを占有

## カテゴリ
クライアント

## 影響するメトリクス
TBT / CPU 使用率 / バッテリー

## 影響度
中

## 作業規模
S

## 問題の原因
`useHasContentBelow` が `scheduler.postTask` を 1ms 間隔の `user-blocking` で再帰実行し、コンテンツに変化がなくても無限に走り続ける。ブラウザアイドル時でもメインスレッドを占有し続けるため、他処理の遅延や電池消費を招く。

## 原因箇所
- [application/client/src/hooks/use_has_content_below.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/hooks/use_has_content_below.ts#L17-L33)

## 解決方法
- `ResizeObserver`/`IntersectionObserver` で必要イベントのみ監視する。
- ポーリングをやめ、最悪でも requestAnimationFrame ベースの間引きを行う。

## 依存関係・注意点
なし
