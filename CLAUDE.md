# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TT-Pulse is a monorepo with two workspaces:
- **`dashboard/`** — Next.js 16 frontend with real-time node monitoring UI
- **`agent/`** — Node.js collector that runs on each monitored Linux machine

The data flow is: `Agent (collectors)` → `Supabase (node_status / node_history tables)` → `Dashboard (Realtime CDC subscription)` → `AI Insight layer`

## Commands

### Root (runs both workspaces)
```bash
npm run dev          # Start dashboard only (Turbopack)
npm run agent        # Start agent
npm run dev:all      # Start both concurrently
npm run check        # Run tsc + lint together (use before every delivery)
npm run check:fix    # Run lint with auto-fix
npm run reinstall    # Clean all node_modules and reinstall
```

### Dashboard (`cd dashboard`)
```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run tsc          # TypeScript check (no emit)
```

### Agent (`cd agent`)
```bash
npm run start        # Run agent (reads agent/.env)
npm run logs         # Follow systemd journal: journalctl -u ttpulse-agent -f
npm run status       # systemctl status ttpulse-agent
```

**Before delivering any change to the dashboard: run `npm run check` from the repo root. It must pass with 0 errors.**

**After changing agent collectors: restart the systemd service.**
```bash
sudo systemctl restart ttpulse-agent.service
```

## Environment Variables

**`dashboard/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**`agent/.env`**
```
SUPABASE_URL=
SUPABASE_KEY=
COMPUTER_NAME=
GITHUB_USERNAME=
AGENT_EMAIL=
AGENT_PASSWORD=
HEARTBEAT_INTERVAL=300000   # ms, default 5 min
GIT_REPO_PATH=              # comma-separated absolute paths to git repos
GIT_PARENT_PATH=            # parent dir — all subdirs with .git are auto-detected
```

## Architecture

### Dashboard

- `app/page.tsx` — Server component; fetches initial `node_status` + `node_history`, generates the initial Texas insight, passes to `DashboardClient`
- `components/DashboardClient.tsx` — Client root; receives SSR data, sets up Supabase Realtime via `useStatus` hook for live updates
- `hooks/useStatus.ts` — Manages Realtime CDC subscription on `node_status`; re-fetches history on each update
- `lib/insights.ts` — Local heuristic engine ("Texas" AI persona); no external API call — this is the primary and only insight path
- `lib/history.ts` — Shared `fetchNodeHistory()` used by both `page.tsx` and `useStatus.ts`
- `lib/constants.ts` — Single source of truth for magic numbers: `ONLINE_THRESHOLD_MINUTES`, `HISTORY_LIMIT`, `RECENT_COMMITS_LIMIT`, `FUNNY_FACT_PROBABILITY`
- `lib/utils.ts` — Shared helpers including `isNodeOnline(lastSeen)` and `formatProcessName()`
- `lib/supabase.ts` — Single shared Supabase client (anon key)
- `lib/stats.ts` — Computes `DashboardStats` from node array (commits, efficiency score, branches)
- `types/index.ts` — Canonical TypeScript types: `NodeStatus`, `HistoryPoint`, `ProcessInfo`, `DashboardStats`, `AiMetadata`

### Agent

- `src/index.js` — Entry point; auto-loads all `.js` files in `collectors/`, authenticates with Supabase, UPSERTs to `node_status` on conflict `node_name`
- `src/collectors/` — Plugin pattern: each file exports `{ name, collect(config) }` returning a partial `node_status` object
  - `system.js` — CPU, RAM, `os_platform`, `os_distro` via `systeminformation`
  - `temp.js` — CPU temperature
  - `git.js` — Recent commits, branch, repo name via local git reflog (async/await, multi-repo via `GIT_PARENT_PATH`)
  - `ops.js` — Top 3 processes by CPU via `ps aux`
  - `ping.js` — Latency measurement
  - `storage.js` — Disk usage

**Adding a new collector:** create a new `.js` file in `src/collectors/` — it is auto-loaded. Return only fields that exist as columns in the `node_status` table or the upsert will fail with a schema cache error.

### Database (Supabase)

Two primary tables:
- `node_status` — One row per node (upserted on `node_name`); holds current metrics including `top_processes` (JSONB) and `recent_commits` (JSONB)
- `node_history` — Append-only time-series populated by a Supabase trigger; dashboard reads only `cpu_usage, ram_usage, cpu_temp, recorded_at`

`node_uptime_report` is a view (uptime analytics) — not used by the dashboard yet.

Migrations live in `supabase/migrations/`. Run them via Supabase dashboard → SQL Editor.

**Critical:** if you add a field to a collector's return object, the matching column must exist in `node_status` first. A missing column causes the heartbeat to fail with a schema cache error.

### Online Status

A node is considered online if `last_seen` is within the last **10 minutes**. This threshold is defined once in `dashboard/lib/constants.ts` as `ONLINE_THRESHOLD_MINUTES` and applied via `isNodeOnline()` from `dashboard/lib/utils.ts`. Do not hardcode this value anywhere else.

### UI Conventions

- **Status labels**: Online = "Grinding", Offline = "Sleeping", Nodes = "Stations"
- **Color palette**: Midnight Nebula — primary accent `#8b5cf6` (violet)
- **Mascot**: Texas (Bengal cat) rendered via `BengalMascot.tsx` with breathing/tail SVG animations
- Always use **hydration guards** (`useEffect`/`useState` with a mounted flag) for any value that differs between server and client renders
- Tremor chart containers need fixed heights to prevent layout shifts
- Do not revert "Bengal Cat / Developer Den" naming back to "Butler/SRE" unless explicitly asked
