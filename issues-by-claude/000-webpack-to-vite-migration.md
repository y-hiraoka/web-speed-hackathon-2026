# Issue 000: Webpack から Vite + React への移行

## 概要

現在のクライアントビルドは Webpack 5 + Babel で構成されているが、意図的に最適化が無効化されている（`mode: "none"`, `minimize: false`, `splitChunks: false`, `inline-source-map`, IE11ターゲット等）。これを Vite に移行することで、多数のパフォーマンス問題がデフォルト設定で解消され、ビルド速度も大幅に改善される。

**重要方針**: 既存の Webpack 設定にある意図的な非最適化オプション（`minimize: false`, `splitChunks: false`, `mode: "none"` 等）を Vite で再現しないこと。Vite のデフォルト最適化（minify、コード分割、Tree Shaking、production モード等）をそのまま活かし、パフォーマンスを最大限に引き出す。

## 現状の問題（Webpack で意図的に無効化されている最適化）

- `webpack.config.js`: `mode: "none"`, `minimize: false`, `splitChunks: false`, `concatenateModules: false`, `devtool: "inline-source-map"` → **Vite では再現しない。デフォルトの最適化をそのまま利用する**
- `babel.config.js`: `targets: "ie 11"`, `modules: "commonjs"`, `useBuiltIns: false` → **Vite の esbuild トランスパイルに任せる（Babel 自体を廃止）**
- エントリポイントで `core-js`, `regenerator-runtime`, `jquery-binarytransport` を丸ごとインポート → **モダンブラウザターゲットにより不要、削除する**
- `ProvidePlugin` で jQuery, AudioContext, Buffer をグローバル注入 → **Vite には ProvidePlugin がないため廃止**
- `NODE_ENV=development` でビルド → **Vite は `vite build` で自動的に production**

## 移行内容

### 1. Vite 設定ファイルの作成 (`vite.config.ts`)

- React プラグイン (`@vitejs/plugin-react`) の導入
- PostCSS 設定の引き継ぎ（既存の `postcss.config.js` をそのまま利用可能）
- 既存の alias 設定の移行（`@ffmpeg/*`, `@imagemagick/*`, `kuromoji`, `bayesian-bm25`）
- `resolve.alias` による WASM モジュールのパス解決
- KaTeX フォントのコピー（`vite-plugin-static-copy` 等）

### 2. エントリポイントの変更

- `index.html` をプロジェクトルートに移動し、Vite のエントリポイントとして使用
- `<script type="module" src="/src/index.tsx">` を追加
- `core-js`, `regenerator-runtime` のインポートを削除
- `jquery-binarytransport` のインポートを削除

### 3. Babel の廃止

- Vite は esbuild でトランスパイルするため Babel 不要
- TypeScript, JSX は esbuild がネイティブサポート
- モダンブラウザターゲット（ESNext）がデフォルト

### 4. package.json の更新

- `webpack`, `webpack-cli`, `webpack-dev-server`, `babel-loader`, `css-loader`, `html-webpack-plugin`, `mini-css-extract-plugin`, `copy-webpack-plugin` 等の devDependencies を削除
- `@babel/core`, `@babel/preset-*` を削除
- `vite`, `@vitejs/plugin-react` を追加
- ビルドスクリプトを `vite build` に変更
- dev スクリプトを `vite` に変更

### 5. CSS の扱い

- Vite は CSS の `@import` をネイティブサポート（`postcss-import` は引き続き使用可能）
- CSS Modules, PostCSS はそのまま動作
- `MiniCssExtractPlugin` は不要（Vite が自動処理）

### 6. 静的アセット・WASM

- WASM ファイルは `?url` サフィックスまたは `assetsInclude` で対応
- `?binary` リソースクエリの代替を検討（`?raw` または カスタムプラグイン）
- public ディレクトリの設定

### 7. 環境変数

- `process.env.NODE_ENV` → Vite は `import.meta.env.MODE` を使用
- `process.env.*` → `import.meta.env.*` に置換、または `define` オプションで互換性維持
- `EnvironmentPlugin` → `vite.config.ts` の `define` で代替

### 8. dev server

- proxy 設定の移行（`/api` → `http://localhost:3000`）
- HMR のサポート（Vite デフォルト）

## Vite 移行で自然に解消される issue

以下の issue は、Vite のデフォルト設定により自動的に解消される：

- **#001** (minimize: false) — Vite は production ビルドで esbuild/terser によるミニファイがデフォルト有効
- **#002** (inline-source-map) — Vite は production ビルドでソースマップを外部ファイルに出力（またはなし）
- **#003** (splitChunks: false) — Vite は dynamic import を自動的にコード分割し、共通チャンクも抽出
- **#004** (Babel IE11 target) — Vite は esbuild でモダンブラウザをターゲットにトランスパイル
- **#005** (core-js full import) — モダンブラウザターゲットにより polyfill が不要
- **#009** (script blocking render) — Vite は `<script type="module">` を生成し、自動的に defer される
- **#033** (ProvidePlugin globals) — ProvidePlugin 自体が廃止され、不要なグローバル注入がなくなる
- **#034** (NODE_ENV=development) — Vite は `vite build` で自動的に production モードを使用
- **#049** (Buffer polyfill) — ProvidePlugin 廃止に伴い Buffer のグローバル注入が解消

## 影響範囲

- `application/client/webpack.config.js` → 削除
- `application/client/babel.config.js` → 削除
- `application/client/vite.config.ts` → 新規作成
- `application/client/src/index.html` → `application/client/index.html` に移動・修正
- `application/client/src/index.tsx` → エントリポイント修正
- `application/client/package.json` → 依存関係の更新
- `process.env.*` を使用している全ファイル → `import.meta.env.*` に置換

## 優先度: 最高

この移行は他の多くの issue の前提となるため、最初に実施すべき。
