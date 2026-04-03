# TASK-02: LCP を改善する（全ページ共通）

## 影響

DM 以外の全ページで LCP が 0〜2点/25点（合計で最大 +175点の伸びしろ）

## 原因

AppContainer が `/api/v1/me` レスポンス待ちの間 `return null` を返すため、意味のあるコンテンツが描画されるまでに大幅な遅延が発生。LCP 要素（テキストや画像）の表示が遅い。

## 対応方針

- AppContainer のローディング中に `null` ではなくページシェル（ナビゲーション + メインエリアの骨格）を返す
- 各コンテナのローディング中もスケルトン UI を返す
- `/api/v1/me` を非ブロッキングにする（認証なしでもコンテンツ描画を先行させる）
- フォントや CSS が LCP をブロックしていないか確認

## 関連ファイル

- `application/client/src/containers/AppContainer.tsx`
- `application/client/src/containers/TimelineContainer.tsx`
- `application/client/src/containers/PostContainer.tsx`
- `application/client/src/containers/SearchContainer.tsx`
- `application/client/src/containers/TermContainer.tsx`
- `application/client/src/containers/UserProfileContainer.tsx`

## 期待効果

LCP 各ページ +10〜20点、合計 +100点以上
