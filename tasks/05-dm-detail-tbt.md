# TASK-05: DM 詳細ページの TBT をさらに改善する

## 影響箇所

DM 詳細ページ TBT（30点満点中 3.30点）

## 現状

TBT 3.30/30。Lighthouse の TBT 満点閾値は 150ms 以下。現在はメインスレッドのブロッキングが大きい。

## 原因候補

1. **100件のメッセージを一度にレンダリング**: DirectMessage.findAll で limit: 100 のメッセージを取得し、全件を一度に DOM に描画
2. **ResizeObserver + scrollTo の連鎖**: メッセージレンダリング中に body リサイズが発生し、scrollTo が繰り返し呼ばれる
3. **WebSocket 接続の初期化処理**: 認証確認→WS接続→イベントリスナー設定のチェーン
4. **未読マーク更新の POST リクエスト**: ページロード時に sendRead() が発火

## 対応方針

1. メッセージの初期表示件数を減らす（100→30件）
2. 仮想スクロールの導入を検討
3. メッセージレンダリングを requestIdleCallback で分割
4. ResizeObserver のコールバックをさらに最適化

## 関連ファイル

- `application/server/src/routes/api/direct_message.ts`
- `application/client/src/components/direct_message/DirectMessagePage.tsx`
- `application/client/src/containers/DirectMessageContainer.tsx`

## 期待効果

TBT +15〜25点
