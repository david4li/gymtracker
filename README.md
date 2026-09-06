# GymTracker

A personal resistance-training tracker: workout logging, routines/templates, strength & volume analytics, body stats, and lightweight programming tools (periodization calculator, weekly split builder).

Single-user, local-only — no accounts, no auth, no cloud sync. Data lives in a local SQLite file (`sqlite.db`).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Drizzle ORM](https://orm.drizzle.team) + `better-sqlite3`
- Tailwind CSS v4
- [Recharts](https://recharts.org) for charts
- [Zustand](https://zustand.docs.pmnd.rs) for in-progress workout UI state
- [Zod](https://zod.dev) for Server Action input validation

> This repo targets Next.js 16, which has real breaking changes vs. older Next.js knowledge (async `params`/`searchParams`, Server Actions as the standard mutation pattern, `proxy` replacing `middleware`, etc.) — see `AGENTS.md` and `node_modules/next/dist/docs/` if you're extending this.

## Getting started

```bash
npm install
npm run db:push   # create the local SQLite schema (sqlite.db)
npm run db:seed   # seed ~65 exercises, sample routines, workouts, and body stats
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`sqlite.db` is gitignored, so a fresh clone starts with no database until you run the two `db:*` commands above.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` / `npm run start` | Production build / run |
| `npm run lint` | ESLint |
| `npm run db:push` | Push the Drizzle schema to `sqlite.db` |
| `npm run db:generate` | Generate versioned SQL migrations (optional; `db:push` is the default local workflow) |
| `npm run db:studio` | Open Drizzle Studio to browse/edit the DB |
| `npm run db:seed` | Seed sample exercises/routines/workouts/body stats (safe to re-run) |

## Project layout

- `app/` — routes (dashboard, exercises, routines, workouts, analytics, body-stats, programming, settings)
- `components/` — UI primitives (`ui/`), nav shell, and feature components grouped by section
- `lib/db/` — Drizzle schema, DB connection singleton, seed data/script
- `lib/queries/` — read-only data access for Server Components
- `lib/actions/` — Zod-validated Server Actions (mutations)
- `lib/calculations/` — pure functions (1RM estimation, PR detection, volume, plateau heuristic, periodization, streaks, unit conversion)
- `lib/store/` — Zustand store for ephemeral active-workout UI state (rest timer, exercise switcher)

## Notes on scope

Programming tools are intentionally lightweight first-pass implementations: the periodization calculator is a stateless generator (not persisted, not per-exercise auto-progression), and the plateau/deload callout on each exercise's analytics page is a simple heuristic, not a statistical model. Everything else (logging, routines, history, analytics, body stats) is fully functional against the local database.
