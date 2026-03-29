# DM 一覧でメッセージを全取得してから JS で reverse し負荷が高い

## カテゴリ
サーバー / DB

## 影響するメトリクス
TTFB / メモリ使用量

## 影響度
中

## 作業規模
S

## 問題の原因
`/api/v1/dm` で `DirectMessageConversation` を取得後、関連メッセージを全件含んだまま `c.messages?.reverse()` を JavaScript で行っている。件数制限が無く全メッセージをメモリに載せてから反転するため、会話履歴が増えるほど応答が肥大化しメモリも消費する。

## 原因箇所
- [application/server/src/routes/api/direct_message.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/routes/api/direct_message.ts#L19-L35)

## 解決方法
- DB クエリで `order` を指定し必要件数のみ（最新数十件）を取得する。
- ページング API を提供し、フロントは必要分だけ要求する。

## 依存関係・注意点
既存 UI が全件表示を前提にしていないか確認する。
