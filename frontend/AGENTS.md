# AGENTS.md — Frontend

**Read the root [`README.md`](../README.md) (Frontend section) before any work here.** It is the source of truth for structure, conventions, and run commands.

## Mandatory rules

1. **Check the folder before creating anything.** Before adding a component, page, section, or asset, confirm it doesn't already exist:
   - UI primitives → `src/components/ui/` (e.g. `Button`, `Logo`, `SectionHeader`)
   - Shared chrome → `src/components/layout/` (`Navbar`, `Footer`)
   - Page sections → `src/components/sections/`
   - Routes/pages → `src/app/<route>/page.tsx` (App Router)
   **Never duplicate a component** — extend the existing one or its props/variants.
2. **Use the `@/*` path alias** (`@/components/...`), not long relative paths.
3. **Styling:** Tailwind CSS v4. Match existing utility-class and brand-color conventions.
4. **Env vars:** client-exposed values must be prefixed `NEXT_PUBLIC_`.
5. **Keep the root README current** when you add/rename/remove a top-level folder or change run commands.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
