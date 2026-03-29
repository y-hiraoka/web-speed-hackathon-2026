# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web Speed Hackathon 2026 — a performance optimization competition. The repo contains "CaX", an intentionally unoptimized SNS application. The goal is to maximize Lighthouse scores (1150 points max) while maintaining visual parity (VRT) and functionality.

## Repository Structure

- `application/` — pnpm monorepo (workspaces in `client/`, `server/`, `e2e/`)
- `scoring-tool/` — Lighthouse-based performance measurement tool
- `docs/` — competition rules, scoring, test cases

## Tech Stack

**Client** (`application/client/`): React 19 + Redux + React Router 7, bundled with Webpack 5 + Babel. Heavy WASM deps: FFmpeg, ImageMagick, web-llm (on-device LLM). CSS via PostCSS. The baseline build is intentionally unoptimized (`minimize: false`, `splitChunks: false`, `concatenateModules: false`, `mode: "none"`, `devtool: "inline-source-map"`).

**Server** (`application/server/`): Express 5 + Sequelize ORM + SQLite, runs via tsx. WebSocket support via ws.

**E2E** (`application/e2e/`): Playwright for Visual Regression Testing.

## Commands

All commands run from `application/` directory:

```bash
# Setup (requires mise for node/pnpm version management)
mise trust && mise install
pnpm install --frozen-lockfile

# Build client (Webpack)
pnpm run build

# Start server (http://localhost:3000)
pnpm run start

# Type check all workspaces
pnpm run typecheck

# Lint and format (oxlint + oxfmt)
pnpm run format

# E2E / VRT (server must be running)
pnpm --filter @web-speed-hackathon-2026/e2e exec playwright install chromium
pnpm run test              # run VRT
pnpm run test:update       # update VRT snapshots

# Server seed data
pnpm --filter @web-speed-hackathon-2026/server run seed:generate
pnpm --filter @web-speed-hackathon-2026/server run seed:insert

# Run scoring tool
cd scoring-tool && pnpm install && tsx src/index.ts --applicationUrl http://localhost:3000
```

## Architecture

### Client (`application/client/src/`)
- `components/` — UI components (foundation, timeline, post, direct_message, crok AI chat, etc.)
- `containers/` — Redux-connected container components (AppContainer, TimelineContainer, PostContainer, etc.)
- `store/` — Redux store with redux-form
- `hooks/` — Custom hooks: `use_fetch`, `use_infinite_fetch`, `use_sse`, `use_ws`, etc.
- `utils/` — Heavy utilities: `bm25_search`, `convert_image` (ImageMagick WASM), `convert_movie` (FFmpeg WASM), `convert_sound`, `negaposi_analyzer`
- Entry: `index.tsx` → renders into `index.html` template

### Server (`application/server/src/`)
- `models/` — Sequelize models: User, Post, Comment, Image, Movie, Sound, DirectMessage, etc.
- `routes/api/` — REST API routes: auth, post, user, image, movie, sound, search, direct_message, crok, initialize
- `routes/static.ts` — serves client dist + public/upload files
- API documented in `server/openapi.yaml` (OpenAPI 3.0)
- DB: SQLite file, seeded from `seeds/` directory

### Key Performance Bottlenecks (by design)
- Webpack: no minification, no code splitting, no tree shaking, inline source maps
- Babel targets IE11 (core-js + regenerator-runtime polyfills)
- Client-side WASM processing: FFmpeg, ImageMagick, web-llm
- jQuery + lodash full bundles
- All media processing happens client-side

## Scoring

- **Page Load (900pts)**: 9 pages × 100pts (FCP:10, SI:10, LCP:25, TBT:30, CLS:25)
- **User Flow (250pts)**: 5 scenarios × 50pts (TBT:25, INP:25) — only scored if page load >= 300pts
- VRT snapshots must pass; manual test cases must pass; regulation violations = disqualification
