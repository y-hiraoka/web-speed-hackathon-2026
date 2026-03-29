# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web Speed Hackathon 2026 — a performance optimization competition. The repo contains "CaX", an intentionally unoptimized SNS application. The goal is to maximize Lighthouse scores (1150 points max) while maintaining visual parity (VRT) and functionality.

## Repository Structure

- `application/` — pnpm monorepo (workspaces in `client/`, `server/`, `e2e/`)
- `scoring-tool/` — Lighthouse-based performance measurement tool
- `docs/` — competition rules, scoring, test cases

## Tech Stack

**Client** (`application/client/`): React 19 + React Router 7, bundled with Vite + @vitejs/plugin-react. CSS via PostCSS + Tailwind CSS 4.

**Server** (`application/server/`): Express 5 + Sequelize ORM + SQLite, runs via tsx. WebSocket support via ws.

**E2E** (`application/e2e/`): Playwright for Visual Regression Testing.

## Commands

All commands run from `application/` directory:

```bash
# Setup (requires mise for node/pnpm version management)
mise trust && mise install
pnpm install --frozen-lockfile

# Build client (Vite)
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
- `containers/` — Container components (AppContainer, TimelineContainer, PostContainer, etc.)
- `hooks/` — Custom hooks: `use_fetch`, `use_infinite_fetch`, `use_sse`, `use_ws`, etc.
- `utils/` — Utilities: `fetchers`, `get_path`, `create_translator`, etc.
- Entry: `index.tsx` → renders into `index.html` (at client root, Vite convention)

### Server (`application/server/src/`)
- `models/` — Sequelize models: User, Post, Comment, Image, Movie, Sound, DirectMessage, etc.
- `routes/api/` — REST API routes: auth, post, user, image, movie, sound, search, direct_message, crok, initialize
- `routes/static.ts` — serves client dist + public/upload files
- `routes/ssr.ts` — SSR data injection for initial page load optimization
- API documented in `server/openapi.yaml` (OpenAPI 3.0)
- DB: SQLite file, seeded from `seeds/` directory

### Optimizations Applied
- Vite build with code splitting, tree shaking, minification
- Media conversion moved to server-side (ffmpeg CLI)
- Translation via browser Translator API (replaced web-llm)
- Kuromoji/negaposi analysis moved to server-side
- Server-side data injection for initial render
- Proper caching headers, gzip compression, DB indexes

## Scoring

- **Page Load (900pts)**: 9 pages × 100pts (FCP:10, SI:10, LCP:25, TBT:30, CLS:25)
- **User Flow (250pts)**: 5 scenarios × 50pts (TBT:25, INP:25) — only scored if page load >= 300pts
- VRT snapshots must pass; manual test cases must pass; regulation violations = disqualification
