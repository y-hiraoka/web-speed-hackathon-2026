# fly.io 配信でも HTTP/2 利用を阻害する Connection: close で多重化できない

## カテゴリ
インフラ / サーバー

## 影響するメトリクス
TTFB / 転送量 / LCP

## 影響度
中

## 作業規模
S

## 問題の原因
全レスポンスに `Connection: close` を付けてしまうため、HTTP/2 の多重化・ヘッダー圧縮の恩恵を受けられない。大量の小リソースを並行取得できず、往復遅延が増える。

## 原因箇所
- [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts#L16-L21)

## 解決方法
- `Connection` ヘッダーを外し、fly.io が提供する HTTP/2/3 の多重化を活かす。
- アセットの結合や HTTP/2 Push（代替で `preload`）も検討する。

## 依存関係・注意点
TLS 終端は fly 側なのでアプリ側の設定変更で対応可能。

## スキップ理由
- `Connection: close` ヘッダーは既に除去済み（現在は `keep-alive` で応答）
- HTTP/2 はブラウザが TLS を要求するため、localhost:3000 (HTTP) 環境では実現不可
- fly.io 上では TLS 終端で自動的に HTTP/2 が有効になるため、アプリ側の追加対応は不要
