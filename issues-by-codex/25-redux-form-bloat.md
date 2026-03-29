# 小規模フォームに redux-form/Redux 全体を読み込みバンドルとレンダーを悪化

## カテゴリ
クライアント / ビルド

## 影響するメトリクス
LCP / TBT / 転送量

## 影響度
中

## 作業規模
M

## 問題の原因
認証・検索・DM など単純なフォームでもすべて `redux-form` と Redux store を介しており、巨大ライブラリがバンドルに含まれる。フォーム入力ごとに Redux ディスパッチと再レンダーが走り、パフォーマンスを阻害する。

## 原因箇所
- [application/client/src/store/index.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/store/index.ts#L1-L12)
- 例: [application/client/src/components/auth_modal/AuthModalPage.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/auth_modal/AuthModalPage.tsx#L1-L110)

## 解決方法
- フォームはローカル state（React Hook Form 等の軽量ライブラリ）で扱い、Redux 依存を外す。
- Redux を使う場合も RTK など軽量構成にし、フォーム用 slice を最小限にする。

## 依存関係・注意点
フォームバリデーションの API 変更に合わせて各コンテナを更新する。
