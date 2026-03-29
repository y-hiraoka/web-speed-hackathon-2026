# Crok SSE エンドポイントに人為的な遅延が挿入されている

## カテゴリ

サーバー

## 影響するメトリクス

TTFB / LCP

## 影響度

中

## 作業規模

S

## 問題の原因

`/crok` エンドポイントで：

1. レスポンス開始前に `await sleep(3000)` で3秒の人為的遅延（TTFT）
2. レスポンスの各文字の間に `await sleep(10)` で10msの遅延
3. 約13.6KBのレスポンスを1文字ずつストリーミング

合計レスポンス時間: 3秒 + (文字数 × 10ms) ≒ 4-5秒以上

注意: レギュレーションで「SSE のストリーミングプロトコルを変更してはならない」とされているが、遅延時間の短縮やチャンク単位の変更は可能と考えられる。

## 原因箇所

`application/server/src/routes/api/crok.ts:37` (`await sleep(3000)`)
`application/server/src/routes/api/crok.ts:45` (`await sleep(10)`)

## 解決方法

1. `sleep(3000)` を削除または大幅に短縮（例: 100ms）
2. `sleep(10)` を削除するか短縮
3. 1文字ずつではなく、単語や行単位でチャンクを送信
4. ただし SSE プロトコル（event: message, data: JSON形式）は維持する

## 依存関係・注意点

- レギュレーション: 「`GET /api/v1/crok{?prompt}` のストリーミングプロトコル (Server-Sent Events) を変更してはならない」
- SSE のイベント形式（event/id/data）は変更不可だが、遅延やチャンクサイズの変更は問題ないと考えられる
- クライアント側の SSE 受信コードの確認が必要
