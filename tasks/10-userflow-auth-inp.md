# TASK-10: 認証フローの INP を改善する

## 影響箇所

ユーザーフロー: ユーザー登録→サインアウト→サインイン INP（25点満点中 4.75点）

## 現状

INP 4.75/25。Lighthouse INP 満点閾値は 200ms 以下。フォーム操作のレスポンスが遅い。

## 原因

1. **モーダル開閉時の重い re-render**: サインインモーダルを開く際に AppContainer 全体が re-render される
2. **フォーム入力時の state 更新が重い**: 各キーストロークで setState → re-render が走る
3. **ボタンクリック時のネットワーク待ち**: サインイン/登録 API のレスポンスを待つ間、UI がブロックされる

## 対応方針

1. **フォームの state 管理を最適化**: useRef でフォーム値を管理し、submit 時のみ state 更新
2. **モーダルコンポーネントの React.memo 化**
3. **useTransition で非緊急 UI 更新を遅延**

## 関連ファイル

- `application/client/src/components/application/AuthModalPage.tsx`
- `application/client/src/containers/AppContainer.tsx`

## 期待効果

INP +10〜15点
