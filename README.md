# GymTracker

Try it out here: https://gymtracker-david4li.vercel.app/

A resistance-training tracker: workout logging, routines and templates, strength and volume
analytics, body stats, and programming tools (periodization calculator, weekly split builder).

Multi-user, with accounts and cloud sync. A Next.js frontend talks to an Express API, which
stores everything in Supabase Postgres behind row-level security.

## Architecture

```
apps/web      Next.js 16 frontend. Server Components fetch the API over HTTP.
apps/api      Express 5 backend. supabase-js, scoped by the caller's JWT.
packages/     shared/ — enums, DTOs, zod schemas, and pure calculations used by both sides.
supabase/     versioned SQL migrations (schema, RLS, indexes, grants).
tools/        one-off migration from the old SQLite file, plus an RLS regression check.
```

The browser never calls the API directly. Server Components and Server Actions call it
server-to-server, which means no CORS, and the Supabase session cookies stay `httpOnly` —
`@supabase/supabase-js` never enters the client bundle, so an XSS payload has no token to steal.

Data isolation is enforced by Postgres row-level security, not by hand-written `where user_id`
clauses. The API attaches the caller's JWT to every query so `auth.uid()` resolves per request.
`tools/verify-rls/` asserts that boundary still holds.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Express 5](https://expressjs.com) + [supabase-js](https://supabase.com/docs/reference/javascript)
- [Supabase](https://supabase.com) Postgres, Auth, and row-level security
- Tailwind CSS v4, [Recharts](https://recharts.org), [Zustand](https://zustand.docs.pmnd.rs)
- [Zod](https://zod.dev), shared between API validation and frontend actions

> This repo targets Next.js 16, which has real breaking changes vs. older Next.js knowledge
> (async `params`/`searchParams`, Server Actions as the standard mutation pattern, `proxy`
> replacing `middleware`). See `apps/web/AGENTS.md` and `node_modules/next/dist/docs/`.

## Getting started

```bash
npm install
cp apps/api/.env.example apps/api/.env      # fill in SUPABASE_PUBLISHABLE_KEY
cp apps/web/.env.example apps/web/.env      # same key, plus API_URL
```

Apply the database schema to your Supabase project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Then run each side in its own terminal:

```bash
npm run dev -w @gymtracker/api    # http://localhost:4000
npm run dev -w @gymtracker/web    # http://localhost:3000
```

Sign up at `/signup`. Email confirmation is on, so the account is created once you follow the
emailed link.

## Deployment

The frontend deploys to Vercel with **Root Directory `apps/web`**; the API deploys to Render
via `render.yaml`, which builds from the repo root so npm workspaces can link the shared
package first. Colocate both regions with your Supabase project.

Render's free plan sleeps after ~15 minutes and takes 30-60s to wake, which will hang the app
mid-workout and can outlast Vercel's function timeout. Use a plan that does not spin down.

## Security notes

- The API is given only the **publishable** key. It refuses to start if handed a secret key,
  because that carries `bypassrls` and would silently defeat every policy.
- `API_URL` has no `NEXT_PUBLIC_` prefix on purpose: the backend URL must not reach the browser.
- Foreign key checks bypass RLS in Postgres, so the API re-checks referenced exercise ids
  through the caller's client before inserting.
