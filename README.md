# Nepex Cargo

Monorepo for the Nepex Cargo / logistics platform. It contains two independent applications:

| App | Path | Stack | Default Port |
|-----|------|-------|--------------|
| **Backend** | [`backend/`](./backend) | Node.js · Express · TypeScript · PostgreSQL (TypeORM) · Redis · BullMQ | `3000` |
| **Frontend** | [`frontend/`](./frontend) | Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 | `3000` |

> ⚠️ Both apps default to port `3000`. Run the backend on a different port (set `PORT` in `backend/.env`) or run them at different times to avoid a clash.

---

## Table of Contents

- [Golden Rules for Contributors & Agents](#golden-rules-for-contributors--agents)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Backend](#backend)
  - [Backend folder structure & use cases](#backend-folder-structure--use-cases)
  - [Before you create a route / controller / service](#before-you-create-a-route--controller--service-read-this)
  - [Environment variables](#backend-environment-variables)
  - [Database connection & connection pool](#database-connection--connection-pool)
  - [Migrations](#migrations)
  - [Seeders](#seeders)
  - [Running the backend](#running-the-backend)
  - [Queues, workers & jobs](#queues-workers--jobs)
  - [Backend scripts reference](#backend-scripts-reference)
- [Frontend](#frontend)
  - [Frontend folder structure & use cases](#frontend-folder-structure--use-cases)
  - [Before you create a component / page / section](#before-you-create-a-component--page--section-read-this)
  - [Environment variables](#frontend-environment-variables)
  - [Running the frontend](#running-the-frontend)
- [Keeping this README up to date](#keeping-this-readme-up-to-date)

---

## Golden Rules for Contributors & Agents

These rules are mandatory for every change (human or AI agent):

1. **Check the folder structure before creating anything.** Every concern already has a home (see the structure tables below). Before adding a route, controller, service, repository, entity, component, page, hook, etc., **open the relevant folder and confirm whether it already exists.** Extend the existing file/module instead of creating a duplicate.
2. **No duplication.** Do not create a second `user.service.ts`, a parallel `auth` route, a redundant `Button` component, etc. Search first (`grep`/file search) and reuse.
3. **Follow the established patterns.** Match the naming, layering, and imports already used in the surrounding code (e.g. backend uses `@config/*`, `@services/*` path aliases; frontend uses `@/*`).
4. **Keep this README current.** If you add, rename, or remove a top-level folder or change how migrations/seeders/connections work, **update this README in the same change** (see [Keeping this README up to date](#keeping-this-readme-up-to-date)).
5. **Respect the layering.** Routes → Controllers → Services → Repositories/Entities. Controllers never hold business logic; services never touch `req`/`res`.

See [`AGENTS.md`](./AGENTS.md) for the agent-facing summary of these rules.

---

## Prerequisites

- **Node.js** `>= 18`
- **pnpm** `>= 9` (`npm install -g pnpm`)
- **PostgreSQL** `>= 14`
- **Redis** `>= 6`

---

## Quick Start

```bash
# 1. Backend
cd backend
pnpm install
cp .env.example .env          # then edit values
pnpm migration:run            # create schema
pnpm seed                     # seed roles & permissions
pnpm dev                      # http://localhost:3000
pnpm worker                   # (separate terminal) background workers

# 2. Frontend
cd frontend
pnpm install
pnpm dev                      # http://localhost:3000
```

---

## Backend

> Full backend-specific docs also live in [`backend/README.md`](./backend/README.md), [`backend/PROJECT_SETUP.md`](./backend/PROJECT_SETUP.md), and [`backend/CODE_STYLE.md`](./backend/CODE_STYLE.md). This section is the authoritative quick reference.

### Backend folder structure & use cases

All source lives under [`backend/src/`](./backend/src). **Before creating a file, find its folder here and check for an existing module.**

```
backend/
├── app.ts                     # Express app: middleware chain + route mounting + error handler
├── server.ts                  # Entry point: boots DB + Redis, starts HTTP server, graceful shutdown
└── src/
    ├── config/                # Configuration & connection setup
    │   ├── env.config.ts          # Validated env vars (envalid) — add new env vars HERE
    │   ├── database.config.ts     # TypeORM DataSource options (+ connection pool)
    │   ├── redis.config.ts        # Redis client + connection object
    │   ├── queue.config.ts        # BullMQ defaults + QUEUE_NAMES registry
    │   └── permission.enums.ts    # Permission/role enums
    │
    ├── database/
    │   ├── data-source.ts         # The AppDataSource singleton (import this everywhere)
    │   ├── entities/              # TypeORM entities (DB tables) — one file per entity
    │   ├── migrations/            # Schema migrations (timestamped) — NEVER edit an applied one
    │   ├── repositories/          # Custom repositories / query helpers
    │   ├── seeders/               # Idempotent data seeders + seeder tracker
    │   └── subscribers/           # TypeORM entity event subscribers
    │
    ├── routes/
    │   └── v1/                    # Versioned API routers; index.ts mounts feature routers
    │
    ├── controllers/           # HTTP handlers: parse req → call service → ApiResponse. NO business logic
    ├── services/              # Business logic. NO req/res. Reuse across controllers/queues/jobs
    │
    ├── integrations/          # Third-party API clients (one folder per provider)
    │   ├── stripe/  ups/  fedex/  dhl/   # each: <name>.client.ts + <name>.service.ts + index.ts
    │
    ├── storage/               # File storage abstraction (local/S3) behind a common interface
    ├── queues/                # BullMQ queues
    │   ├── producers/             # Enqueue jobs
    │   ├── consumers/             # Process jobs
    │   └── queue.factory.ts       # Queue/worker factory
    ├── workers/               # worker.bootstrap.ts — long-running worker process entry
    ├── jobs/                  # Scheduled/cron jobs (job.scheduler.ts)
    ├── events/                # In-process event bus
    │   ├── emitters/  listeners/  handlers/   # event-driven side effects
    │
    └── common/                # Shared, cross-cutting code (no business logic)
        ├── dto/                  # Request/response DTOs & Zod schemas
        ├── types/                # Shared TypeScript types
        ├── enums/                # Shared enums
        ├── constants/            # Shared constants
        ├── decorators/           # Custom decorators
        ├── middlewares/          # Express middlewares (auth, error, rate-limit, validate, logging)
        ├── exceptions/           # AppException + typed HTTP exceptions
        ├── validators/           # Reusable validators
        ├── helpers/              # ApiResponse, logger, permission helpers
        └── interfaces/           # Shared interfaces
```

**Path aliases** (configured in [`backend/tsconfig.json`](./backend/tsconfig.json)) — always use these instead of long relative paths:
`@config/*`, `@common/*`, `@controllers/*`, `@services/*`, `@routes/*`, `@database/*`, `@integrations/*`, `@queues/*`, `@workers/*`, `@jobs/*`, `@events/*`, `@storage/*`.

### Before you create a route / controller / service (READ THIS)

To add a new feature endpoint (e.g. `shipments`), go through this checklist **in order** and reuse anything that already exists:

1. **Entity** — Does `src/database/entities/<name>.entity.ts` exist? If not and you need a new table, create the entity **and** a migration (see [Migrations](#migrations)). Register exports in `entities/index.ts`.
2. **Repository** (optional) — Need custom queries? Add/extend `src/database/repositories/<name>.repository.ts`. Otherwise use `AppDataSource.getRepository(Entity)`.
3. **Service** — Check `src/services/` for an existing `<name>.service.ts`. Put **all business logic** here. Export a singleton instance (see [`user.service.ts`](./backend/src/services/user.service.ts)). Register in `services/index.ts`.
4. **Controller** — Check `src/controllers/` for `<name>.controller.ts`. Controllers only: read `req`, call the service, return via `ApiResponse`, and `next(error)` on failure. **No business logic here.**
5. **Route** — Check `src/routes/v1/` for `<name>.routes.ts`. Define the router, attach middlewares (`checkPermission()`, `validate(schema)`), then **mount it in [`src/routes/v1/index.ts`](./backend/src/routes/v1/index.ts)** under `v1Router`. (The app mounts `v1Router` at `/api/v1` in [`app.ts`](./backend/app.ts).)
6. **DTO/validation** — Add Zod schemas/DTOs in `src/common/dto/` and validate with the `validate` middleware.

> ❗ **Never create a duplicate** of an existing service/controller/route. If `user.service.ts` already exists, add methods to it — do not create `users.service.ts` or `user2.service.ts`.

### Backend environment variables

Copy [`backend/.env.example`](./backend/.env.example) → `backend/.env` and fill in values. All env vars are **validated at boot** by [`env.config.ts`](./backend/src/config/env.config.ts) — the app will refuse to start if a required one is missing.

| Group | Keys |
|-------|------|
| App | `NODE_ENV`, `PORT`, `LOG_LEVEL` |
| Database | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL` |
| Redis | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` |
| Auth | `JWT_SECRET`, `JWT_EXPIRES_IN` |
| CORS | `CORS_ORIGINS` (comma-separated) |
| Storage | `STORAGE_DRIVER` (`local`\|`s3`), `LOCAL_STORAGE_PATH`, `AWS_*`, `AWS_S3_BUCKET` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| UPS / FedEx / DHL | `UPS_*`, `FEDEX_*`, `DHL_*` |

> **When you add a new env var:** add it to `.env.example`, validate it in `env.config.ts`, and reference it via `env.YOUR_VAR` (never read `process.env` directly elsewhere).

### Database connection & connection pool

- The single source of truth is **[`AppDataSource`](./backend/src/database/data-source.ts)**, built from [`database.config.ts`](./backend/src/config/database.config.ts). Always import `AppDataSource` (or a repository) — never create your own `DataSource`.
- It is initialized once at startup in [`server.ts`](./backend/server.ts) (`await AppDataSource.initialize()`), and destroyed on graceful shutdown (`SIGTERM`/`SIGINT`).
- `synchronize: false` and `migrationsRun: false` — **schema changes only happen through migrations**, never auto-sync.
- Entities, migrations, and subscribers are auto-discovered by glob from their folders.

**Connection pool:** TypeORM uses the `pg` (node-postgres) driver, which pools connections automatically (default pool size **10**). To tune the pool, add an `extra` block to `database.config.ts`:

```ts
export const databaseConfig: DataSourceOptions = {
  // ...existing options...
  extra: {
    max: 20,                       // max connections in the pool
    min: 2,                        // min idle connections kept open
    idleTimeoutMillis: 30000,      // close idle clients after 30s
    connectionTimeoutMillis: 5000, // fail if no connection within 5s
  },
};
```

Redis has its own client in [`redis.config.ts`](./backend/src/config/redis.config.ts) (connected at boot, reused by BullMQ via `redisConfig`).

### Migrations

Migrations live in [`backend/src/database/migrations/`](./backend/src/database/migrations) and are tracked in the `typeorm_migrations` table. Run all commands from `backend/`.

```bash
# Generate a migration from entity changes (diff against the current DB)
pnpm migration:generate src/database/migrations/<DescriptiveName>

# Apply all pending migrations
pnpm migration:run

# Revert the most recent migration
pnpm migration:revert

# Show applied vs pending migrations
pnpm migration:show
```

**File naming** — every migration file must follow the project's UTC-based naming convention. See [`backend/src/database/migrations/RULES.md`](./backend/src/database/migrations/RULES.md) for the full rules. In short, the file name is a **15-digit UTC timestamp** + a descriptive name:

```
<YY><MM><DD><HH><mm><ss><SSS>-<some-name>.ts
```

e.g. for `2026-06-24 17:55:03.249` UTC → `26` + `06` + `24` + `17` + `55` + `03` + `249` → `260624175503249-add-shipment-table.ts` (class `AddShipmentTable260624175503249`). Generate the timestamp with:

```bash
node -e "const d=new Date(),p=(n,l=2)=>String(n).padStart(l,'0');console.log(`${p(d.getUTCFullYear()%100)}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}${p(d.getUTCMilliseconds(),3)}`)"
```

**Rules:**
- One migration per schema change; use a descriptive name (e.g. `add-shipment-table`).
- **Never edit a migration that has already been applied** to a shared/production DB — create a new one instead.
- Every `up()` must have a correct, reversible `down()`. See [`1715000000000-CreateUsersRolesPermissions.ts`](./backend/src/database/migrations/1715000000000-CreateUsersRolesPermissions.ts) for the established pattern (tables → indices → foreign keys, reversed in `down`).
- Migrations are written with the QueryRunner API (`createTable`, `createForeignKey`, …), not raw SQL, to stay DB-portable.

### Seeders

Seeders live in [`backend/src/database/seeders/`](./backend/src/database/seeders) and are **idempotent** — tracked in the `typeorm_seeders` table by name, so re-running skips already-applied seeders.

```bash
pnpm seed
```

**To add a seeder:**
1. Create `src/database/seeders/<name>.seeder.ts` exporting a `SeederMeta` (`{ name, run }`) — see [`roles-permissions.seeder.ts`](./backend/src/database/seeders/roles-permissions.seeder.ts).
2. Register it in the `seeders` array in [`src/database/seeders/index.ts`](./backend/src/database/seeders/index.ts).
3. The [seeder-tracker](./backend/src/database/seeders/seeder-tracker.ts) handles table creation, run-once tracking, and skipping.

> Run `pnpm migration:run` **before** `pnpm seed` — seeders assume the schema exists.

### Running the backend

```bash
pnpm dev        # nodemon + ts-node, hot reload (http://localhost:3000)
pnpm worker     # background worker process (BullMQ consumers) — run in a separate terminal
pnpm build      # compile TypeScript to dist/
pnpm start      # run compiled server (dist/server.js)
```

Health check: `curl http://localhost:3000/health`. The API is served under `/api/v1`.

### Queues, workers & jobs

- **Queues** ([`src/queues/`](./backend/src/queues)) — BullMQ. Add new queue names to `QUEUE_NAMES` in [`queue.config.ts`](./backend/src/config/queue.config.ts). Producers enqueue; consumers process.
- **Workers** ([`src/workers/worker.bootstrap.ts`](./backend/src/workers/worker.bootstrap.ts)) — the process started by `pnpm worker`; wires up consumers.
- **Jobs** ([`src/jobs/job.scheduler.ts`](./backend/src/jobs/job.scheduler.ts)) — scheduled/recurring jobs.
- **Events** ([`src/events/`](./backend/src/events)) — in-process event bus for side effects (emitters/listeners/handlers).

### Backend scripts reference

| Command | Purpose |
|---------|---------|
| `pnpm dev` / `pnpm worker` | Run dev server / worker |
| `pnpm build` / `pnpm start` | Compile / run production build |
| `pnpm migration:run` / `:revert` / `:generate` / `:show` | Migrations |
| `pnpm seed` | Run seeders |
| `pnpm test` / `:unit` / `:integration` / `:e2e` / `:coverage` | Jest tests ([`backend/tests/`](./backend/tests)) |
| `pnpm format:check` / `format:write` | Prettier |
| `pnpm lint:check` / `lint:fix` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |

**Before committing:** `pnpm format:write && pnpm lint:fix && pnpm typecheck && pnpm test`.

---

## Frontend

A Next.js 16 (App Router) + React 19 + Tailwind CSS v4 application in [`frontend/`](./frontend).

> ⚠️ **This is not the Next.js you may know.** Next.js 16 has breaking changes. Before writing Next.js code, read the relevant guide in `frontend/node_modules/next/dist/docs/` and heed deprecation notices (see [`frontend/AGENTS.md`](./frontend/AGENTS.md)).

### Frontend folder structure & use cases

All source lives under [`frontend/src/`](./frontend/src). **Before creating a file, find its folder here and check for an existing module.**

```
frontend/
├── public/                    # Static assets served as-is (images, logo, svgs)
└── src/
    ├── app/                   # Next.js App Router: routes, layouts, pages
    │   ├── layout.tsx             # Root layout (fonts, <html>/<body>, global metadata)
    │   ├── page.tsx               # Home page ("/")
    │   ├── globals.css            # Global styles / Tailwind layers
    │   └── <route>/page.tsx       # Add new routes as folders here
    │
    ├── components/
    │   ├── ui/                    # Reusable primitives (Button, Logo, SectionHeader) — generic, no page logic
    │   ├── layout/               # Shared chrome (Navbar, Footer)
    │   └── sections/             # Page sections (Hero, Stats, Testimonials, CTA, …) composed into pages
    │
    └── assets/                # Imported assets (svgs) used inside components
```

**Path alias:** `@/*` → `frontend/src/*` (see [`frontend/tsconfig.json`](./frontend/tsconfig.json)). Use `@/components/...` instead of relative paths.

### Before you create a component / page / section (READ THIS)

1. **UI primitive?** Check [`src/components/ui/`](./frontend/src/components/ui) first (e.g. `Button`, `Logo`, `SectionHeader`). Reuse/extend an existing primitive rather than rebuilding one.
2. **Layout/chrome?** Navbar/Footer live in [`src/components/layout/`](./frontend/src/components/layout).
3. **Page section?** Larger composable blocks go in [`src/components/sections/`](./frontend/src/components/sections) and are assembled in `app/.../page.tsx`.
4. **New route/page?** Add a folder under [`src/app/`](./frontend/src/app) with a `page.tsx` (App Router convention). Don't put route logic in `components/`.
5. **Styling:** Tailwind CSS v4. Match existing utility-class conventions and the brand color usage already in components (see [`Button.tsx`](./frontend/src/components/ui/Button.tsx)).

> ❗ **Do not duplicate components.** Search `src/components/` before adding anything; extend the existing component or its variants/props instead.

### Frontend environment variables

`frontend/.env` holds Next.js env vars. Client-exposed variables **must** be prefixed `NEXT_PUBLIC_`. Restart `pnpm dev` after changing env values.

### Running the frontend

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:3000 (set backend PORT elsewhere to avoid clash)
pnpm build      # production build
pnpm start      # serve production build
pnpm lint       # ESLint
```

---

## Keeping this README up to date

This README is the source of truth for project structure and workflows. **Whenever you:**

- add / rename / remove a top-level folder under `backend/src` or `frontend/src`,
- change how migrations, seeders, the DB connection, or the connection pool work,
- add a new integration, queue, worker, or env var group,
- change run/build commands,

➡️ **update the matching section of this README in the same change/PR.** Treat a structural change with a stale README as incomplete. The companion [`AGENTS.md`](./AGENTS.md), [`backend/AGENTS.md`](./backend/AGENTS.md), and [`frontend/AGENTS.md`](./frontend/AGENTS.md) instruct all agents to follow and maintain this document.
