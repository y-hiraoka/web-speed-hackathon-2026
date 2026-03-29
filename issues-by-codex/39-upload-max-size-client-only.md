# 10MB 制限をクライアントだけで判定しサーバーで弾かれずリソース浪費

## カテゴリ
クライアント / サーバー

## 影響するメトリクス
帯域 / CPU / メモリ（アップロード時）

## 影響度
低

## 作業規模
S

## 問題の原因
アップロードサイズ上限 10MB をフロントのチェックにのみ依存し、サーバーの `bodyParser.raw({ limit: "10mb" })` はグローバル適用のまま。クライアント改変や複数同時アップロードで容易に超過でき、サーバーが受信・パースしようとしてメモリを消費する。

## 原因箇所
- [application/client/src/components/new_post_modal/NewPostModalPage.tsx](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/client/src/components/new_post_modal/NewPostModalPage.tsx#L12-L98)
- [application/server/src/app.ts](/Users/y-hiraoka/dev/web-speed-hackathon-2026-worktree/application/server/src/app.ts#L12-L15)

## 解決方法
- サーバー側でルートごとに厳格な `limit` を設定し、サイズ超過時は早期 413 を返す。
- ストリーミング処理や分割アップロードを検討する。

## 依存関係・注意点
大容量ファイルを扱わない場合でも DoS 回避のためサーバー側制限は必須。
