# 未読数計算が接続毎に全件 COUNT し高コスト

## カテゴリ
サーバー / DB

## 影響するメトリクス
TTFB / CPU

## 影響度
低

## 作業規模
S

## 問題の原因
`/api/v1/dm/unread` の WebSocket 接続時に `DirectMessage.count` を include 付きで実行し、ユーザーの全未読を毎回フルスキャンしている。接続が多いと COUNT が連発し DB 負荷が高まる。

## 原因箇所
- [application/server/src/routes/api/direct_message.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/direct_message.ts#L64-L96)

## 解決方法
- 未読数をメッセージ作成/既読更新時にインクリメント・デクリメントで保持するカウンタに切り替える。
- あるいは WebSocket 接続直後はキャッシュ値を返し、差分のみイベントで更新する。

## 依存関係・注意点
カウンタ整合性を保つためトランザクション更新に注意。
