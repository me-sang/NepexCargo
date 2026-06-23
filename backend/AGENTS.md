# AGENTS.md — Backend

**Read the root [`README.md`](../README.md) (Backend section) before any work here.** It is the source of truth for structure, migrations, seeders, DB connection/pool, and run commands. Also see [`README.md`](./README.md), [`PROJECT_SETUP.md`](./PROJECT_SETUP.md), and [`CODE_STYLE.md`](./CODE_STYLE.md) in this folder.

## Mandatory rules

1. **Check the folder before creating anything.** Each concern has a home under `src/` (see the structure table in the root README). Before adding a route, controller, service, repository, entity, migration, seeder, middleware, integration, queue, job, DTO, or env var, **confirm it doesn't already exist** and extend it if it does. **Never create duplicates** (e.g. a second `user.service.ts`).

2. **Layering.** Routes → Controllers → Services → Repositories/Entities.
   - Controllers: parse `req`, call a service, return via `ApiResponse`, `next(error)` on failure. **No business logic.**
   - Services: all business logic, exported as a singleton. **No `req`/`res`.**
   - Mount every new router in `src/routes/v1/index.ts` (served under `/api/v1`).

3. **Use path aliases** (`@config/*`, `@common/*`, `@controllers/*`, `@services/*`, `@routes/*`, `@database/*`, `@integrations/*`, `@queues/*`, `@workers/*`, `@jobs/*`, `@events/*`, `@storage/*`) — not long relative paths.

4. **Config & env.** Add/validate every env var in `src/config/env.config.ts`, add it to `.env.example`, and read it via `env.*` (never `process.env` directly).

5. **Database.** Import the shared `AppDataSource` (or a repository); never construct a new `DataSource`. `synchronize`/`migrationsRun` are off — **schema changes only via migrations.** Never edit an applied migration; add a new one with a reversible `down()`. Keep seeders idempotent and registered in `src/database/seeders/index.ts`.

6. **Before committing:** `pnpm format:write && pnpm lint:fix && pnpm typecheck && pnpm test`.

7. **Keep the root README current** when you change folders, migrations, seeders, the connection/pool, integrations, queues, or commands.
