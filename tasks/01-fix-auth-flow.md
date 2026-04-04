# TASK-01: 認証フローの失敗を修正する

## 影響

ユーザーフロー: 登録→サインイン（50点）が計測不能

## エラー

"サインインに失敗しました"

## 原因

AuthModalPage を uncontrolled inputs に変更した際、FormInputField の ref 転送に問題がある可能性。Playwright の pressSequentially は DOM 要素に直接入力するが、useRef で値を読み取る getValues() が正しく動作していない。

## 対応方針

1. FormInputField の ref forwarding を確認・修正
2. getValues() が実際の入力値を取得できているか確認
3. submit 時に ref.current.value が正しく読めることを保証

## 関連ファイル

- `application/client/src/components/auth_modal/AuthModalPage.tsx`
- `application/client/src/components/foundation/FormInputField.tsx`

## 期待効果

+50点
