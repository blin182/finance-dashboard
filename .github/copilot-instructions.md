Project snapshot

- Next.js (App Router) dashboard app (Next v15). TypeScript + Tailwind.
- DB access: raw Postgres client via the `postgres` package. SQL lives in server-side helpers.
- Auth: `next-auth` (v5) with credentials provider. See `auth.ts` and `auth.config.ts`.

Quick commands

- Install: pnpm install
- Dev: pnpm dev (runs `next dev --turbopack`)
- Build: pnpm build
- Start (prod): pnpm start
- Lint: pnpm lint

High-level architecture (what to know fast)

- App Router structure: pages and UI live under `app/`. Root layout: `app/layout.tsx`.
- Dashboard area: `app/dashboard/*` with a dashboard layout at `app/dashboard/layout.tsx`.
- Reusable UI lives under `app/ui/` (e.g. `app/ui/dashboard/sidenav.tsx`, `app/ui/customers/table.tsx`).
- Server-only data & actions live in `app/lib/` (e.g. `app/lib/data.ts`, `app/lib/actions.ts`, `app/lib/definitions.ts`).
  - `data.ts` contains DB queries and pagination logic (ITEMS_PER_PAGE) and returns typed results.
  - `actions.ts` contains server actions (uses `'use server'`) that validate with Zod and call SQL.

Key conventions & patterns (explicit examples)

- Server actions: mark functions with `'use server'` inside the action handler (see `app/lib/actions.ts`).
  Example pattern: forms call server actions which validate with `zod`, perform SQL (via `postgres`), then call `revalidatePath()` and `redirect()`.
- DB client: created with `postgres(process.env.POSTGRES_URL!, { ssl: 'require' })`. Always expect `POSTGRES_URL` env var.
- Types: central types live in `app/lib/definitions.ts` (Customer, Invoice, User, etc.). Use these for props and returned rows.
- Auth: `auth.ts` wires NextAuth; `Credentials` provider uses bcryptjs to compare passwords. Use `signIn`/`signOut` helpers exported from `auth.ts`.
- Middleware: `middleware.ts` sets a matcher to protect non-api/static routes. See its `matcher` config — be careful when adding new public routes.
- UI & styling: Tailwind is used site-wide. Global CSS at `app/ui/global.css` and fonts in `app/ui/fonts.ts`.

Integration points & environment

- Required env vars: POSTGRES_URL (DB), optionally VERCEL_PROJECT_PRODUCTION_URL (used for metadata base url).
- DB access points: `app/lib/data.ts` (reads) and `app/lib/actions.ts` (writes). Keep heavy SQL in these files.
- Seed & query helpers: `app/query/route.ts` and `app/seed/route.ts` provide examples of route handlers.

Developer guidance for changes

- Prefer small, focused edits. This repo separates UI (app/ui) from server concerns (app/lib). Move DB or auth logic into `app/lib` rather than sprinkling SQL across UI files.
- When adding a form handler, follow `actions.ts` pattern: Zod validation -> postgres call -> revalidatePath -> redirect.
- For server-side fetches use functions in `app/lib/data.ts` so they can be reused by multiple pages/components.
- Avoid modifying `middleware.ts` matcher unless you must; changing it can unintentionally expose or block routes.

Where to look first (quick pointers)

- App entry & HTML: `app/layout.tsx`
- Dashboard shell: `app/dashboard/layout.tsx` and `app/ui/dashboard/sidenav.tsx`
- Data fetching and SQL: `app/lib/data.ts`
- Server actions (forms/auth): `app/lib/actions.ts`
- Auth wiring: `auth.ts`, `auth.config.ts`
- Types: `app/lib/definitions.ts`
- Demo/test data: `app/lib/placeholder-data.ts` and `public/customers/`

Edge cases to watch for (from current code)

- Several queries assume `postgres` rows and map values (e.g. amounts in cents). Keep units consistent.
- `fetchRevenue()` intentionally delays three seconds for demo purposes—do not add similar delays to production flows.
- `next.config.ts` disables eslint during build. Lint locally before opening PRs.

If anything is unclear or you want more detail (example: typical PR edits, tests to add, or areas to avoid), tell me which area and I will expand/iterate.
