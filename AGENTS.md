# AGENTS.md

**Read [`README.md`](./README.md) before doing any work in this repo.** It is the source of truth for project structure, conventions, and workflows. These rules apply to every agent (Claude, Codex, Copilot, Gemini, etc.) and human contributor.

## Mandatory rules

1. **Follow [`README.md`](./README.md).** Migrations, seeders, DB connection/pool, run commands, and folder responsibilities are documented there — use them, don't reinvent them.

2. **Check the folder structure before creating anything.** Every concern already has a home (see the structure tables in the README). Before adding a route, controller, service, repository, entity, migration, seeder, component, page, section, hook, util, or env var, **open the relevant folder and confirm it doesn't already exist.**

3. **Never duplicate.** Search first (file search / grep). If a `*.service.ts`, route, component, etc. already exists, **extend it** — do not create a parallel or near-duplicate file.

4. **Respect the layering & patterns.**
   - Backend: Routes → Controllers → Services → Repositories/Entities. Controllers hold no business logic; services never touch `req`/`res`. Use the `@config/*`, `@services/*`, … path aliases. New env vars go through `src/config/env.config.ts`.
   - Frontend: UI primitives in `components/ui`, chrome in `components/layout`, page blocks in `components/sections`, routes in `app/`. Use the `@/*` alias. **Next.js 16 has breaking changes — read `frontend/node_modules/next/dist/docs/` before writing Next.js code.**

5. **Schema changes go through migrations only** (`synchronize` is off). Never edit an already-applied migration; create a new one. Seeders must stay idempotent and be registered in `src/database/seeders/index.ts`.

6. **Keep docs current.** If you add/rename/remove a top-level folder, or change migrations/seeders/connection/run commands, **update [`README.md`](./README.md) in the same change.** A structural change with a stale README is incomplete.

7. **Keep Swagger docs current.** The backend API is documented with `@asteasolutions/zod-to-openapi`. **Whenever you add, remove, or modify a route, request body, query/path param, or response shape, update `backend/src/docs/<feature>.docs.ts` in the same change.** Register new doc files in `backend/src/docs/index.ts`. See `backend/AGENTS.md` rule 6 for details.

## Scope-specific guides

- Backend agents: [`backend/AGENTS.md`](./backend/AGENTS.md)
- Frontend agents: [`frontend/AGENTS.md`](./frontend/AGENTS.md)
