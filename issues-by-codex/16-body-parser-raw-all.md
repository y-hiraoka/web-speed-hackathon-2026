# 全リクエストで raw ボディをパースし続け無駄なメモリ確保が発生

## カテゴリ
サーバー

## 影響するメトリクス
TTFB / メモリ使用量

## 影響度
中

## 作業規模
S

## 問題の原因
`bodyParser.raw({ limit: "10mb" })` をグローバルに適用しているため、JSON 以外の全リクエスト（静的配信含む）で 10MB までのバッファ確保とパースが行われる。通常の JSON API には不要で、静的ファイルや SSE にも余計な処理が入る。

## 原因箇所
- [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts#L12-L15)

## 解決方法
- raw ボディが必要なエンドポイント（画像/音声/動画アップロードなど）に限定してミドルウェアを適用する。
- それ以外は `bodyParser.json` のみ、または必要最小限のサイズに制限する。

## 依存関係・注意点
適用順序に注意し、アップロード系ルートの前にだけ raw ミドルウェアを差し込む。
