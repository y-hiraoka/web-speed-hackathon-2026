# TASK-12: ホームページの Speed Index を改善する

## 影響箇所

ホームページ SI（10点満点中 3.60点）

## 現状

Speed Index は「ビューポートがどのくらい速く視覚的に完成するか」を測る。3.60/10 は、ビューポートの大部分が長時間空白であることを示す。

## 原因

1. **初期表示が完全に空白**: HTML が空 div のため、JS ロード完了まで真っ白
2. **ポスト一覧のレンダリングが逐次的**: 10件のポストが一度にレンダリングされるが、各ポストの Markdown パースが重い
3. **画像の遅延読み込み**: プロフィール画像が loading="lazy" のため、ビューポート内でも表示が遅れる

## 対応方針

1. TASK-01 の SSR で初期シェルを提供（最大の効果）
2. **最初のビューポート分のポスト（2〜3件）だけ即時レンダリング**、残りは requestIdleCallback で後から追加
3. **ファーストビューの画像を eager ロードに変更**

## 関連ファイル

- `application/client/src/containers/TimelineContainer.tsx`
- `application/client/src/components/timeline/TimelineItem.tsx`

## 期待効果

SI +3〜5点
