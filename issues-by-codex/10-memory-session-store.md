# セッションを MemoryStore に保持しプロセス間共有不可＆メモリ肥大のリスク

## カテゴリ
サーバー

## 影響するメトリクス
TTFB / メモリ使用量 / スループット

## 影響度
中

## 作業規模
M

## 問題の原因
`express-session` の `MemoryStore` をそのまま本番で使用しており、全セッションを単一プロセスのヒープに保持する。セッション数に比例してメモリ消費が増大し、スワップや GC 停止時間が伸びるうえ、プロセス再起動やスケールアウトでセッションが失われる。

## 原因箇所
- [application/server/src/session.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/session.ts#L1-L10)

## 解決方法
- Redis 等の永続ストア対応の session store（`connect-redis` など）に切り替える。
- 競技要件が許すなら、セッションレスなトークン認証（JWT）へ移行してサーバー状態を持たないようにする。
- セッション有効期限の設定とクリーンアップを導入し、上限を設ける。

## 依存関係・注意点
インフラ追加が必要になる場合は fly.io のアドオン利用などを検討。セッション仕様変更時はクライアントのログインフロー動作確認が必要。
