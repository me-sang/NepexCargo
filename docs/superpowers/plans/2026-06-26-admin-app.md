# Admin App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold and implement the `admin/` Next.js 16 application that gives Nepex Cargo super admins full control over tenants, plans, payments, and platform settings at `admin.nepexcargo.com`.

**Architecture:** 8 tasks in order: scaffold the app → auth foundation (token helpers, fetch wrapper, middleware) → login page → protected layout with sidebar → dashboard stat cards → tenant CRUD pages → plan CRUD pages → payments + settings pages. Each task ends with `pnpm build` passing zero errors and a git commit.

**Tech Stack:** Next.js 16.2.6 · React 19.2.4 · TypeScript 5 · Tailwind CSS v4 · `@tailwindcss/postcss` · `pnpm`

## Global Constraints

- All commands run from `admin/` directory
- Build check: `pnpm build` (must pass with 0 errors before each commit)
- Typecheck: `npx tsc --noEmit`
- No unit tests for UI pages — verification is manual browser check described in each task
- API base URL: `process.env.NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3000/api/v1`)
- JWT stored in a cookie named `admin_token`; middleware protects all routes except `/login`
- After impersonation redirect to `https://dashboard.nepexcargo.com?impersonateToken=<token>`
- Use `@/*` path alias (`./src/*`) — never long relative paths
- No heavy state management library — React Context for auth, `fetch` for data
- Tailwind: dark sidebar (`bg-slate-900`) with white content area
- Path aliases: `@/*` → `./src/*`
- Commit after each task, not after each file

---

### Task 1: Scaffold

**Files:**
- Create: `admin/package.json`
- Create: `admin/tsconfig.json`
- Create: `admin/next.config.ts`
- Create: `admin/postcss.config.mjs`
- Create: `admin/.env.example`
- Create: `admin/src/app/globals.css`
- Create: `admin/src/app/layout.tsx`

**Interfaces:**
- Produces: a compilable Next.js 16 app shell that `pnpm build` can run to 0 errors

- [ ] **Step 1: Create `admin/package.json`**

Match exact versions from `frontend/package.json`. Add `Inter` instead of Plus Jakarta Sans (clean admin aesthetic).

```json
{
  "name": "admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start --port 3002",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "sharp",
      "unrs-resolver"
    ]
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `admin/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `admin/next.config.ts`**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Create `admin/postcss.config.mjs`**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 5: Create `admin/.env.example`**

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

- [ ] **Step 6: Create `admin/src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-sidebar: #0f172a;
  --color-sidebar-hover: #1e293b;
  --color-sidebar-active: #1e40af;
  --color-brand: #2563eb;
  --color-brand-hover: #1d4ed8;
}
```

- [ ] **Step 7: Create `admin/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nepex Cargo Admin",
  description: "Super admin panel for Nepex Cargo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Install dependencies and verify build**

```bash
cd admin
pnpm install
pnpm build
```

Expected: build completes with 0 errors. You will see Next.js output including route compilation.

- [ ] **Step 9: Commit**

```bash
git add admin/
git commit -m "feat(admin): scaffold Next.js 16 admin app with Tailwind v4"
```

---

### Task 2: Auth foundation

**Files:**
- Create: `admin/src/lib/auth.ts`
- Create: `admin/src/lib/api.ts`
- Create: `admin/src/middleware.ts`

**Interfaces:**
- Produces: `getToken()`, `setToken(token)`, `clearToken()` · `apiFetch(path, init?)` · Next.js middleware that guards all routes except `/login`

- [ ] **Step 1: Create `admin/src/lib/auth.ts`**

Token helpers that work in both browser and server contexts. In browser, use `document.cookie` directly (no dependency needed). The middleware reads the raw cookie header server-side.

```typescript
const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Returns the JWT from the browser cookie, or null if absent. */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  return match ? match.split("=")[1] : null;
}

/** Stores the JWT as a browser cookie. */
export function setToken(token: string): void {
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Removes the JWT cookie (logout). */
export function clearToken(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export { COOKIE_NAME };
```

- [ ] **Step 2: Create `admin/src/lib/api.ts`**

A thin `fetch` wrapper that attaches `Authorization: Bearer <token>` and throws a typed error on non-2xx responses. On 401, clears the token so the middleware redirects on next navigation.

```typescript
import { clearToken, getToken } from "@/lib/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      (body as { message?: string }).message ?? `HTTP ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
```

- [ ] **Step 3: Create `admin/src/middleware.ts`**

Next.js middleware that runs on every request. Redirects unauthenticated users to `/login`. The public route list must be explicitly enumerated — everything else requires a token.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow Next.js internals through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 4: Build check**

```bash
pnpm build
```

Expected: 0 errors. The middleware and lib files are TypeScript-only and will be validated at build time.

- [ ] **Step 5: Commit**

```bash
git add admin/src/lib/auth.ts admin/src/lib/api.ts admin/src/middleware.ts
git commit -m "feat(admin): add auth token helpers, fetch wrapper, and middleware guard"
```

---

### Task 3: Login page

**Files:**
- Create: `admin/src/app/login/page.tsx`

**Interfaces:**
- Consumes: `POST /api/v1/admin/auth/login` → `{ token: string, admin: { id: string, email: string, name: string } }`
- Produces: `/login` page that sets `admin_token` cookie and redirects to `/dashboard`

- [ ] **Step 1: Create `admin/src/app/login/page.tsx`**

```tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as {
        token?: string;
        message?: string;
      };

      if (!res.ok) {
        setError(data.message ?? "Login failed. Check your credentials.");
        return;
      }

      if (!data.token) {
        setError("No token returned from server.");
        return;
      }

      setToken(data.token);
      router.push("/dashboard");
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo / wordmark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-slate-900">
              Nepex Cargo
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Super admin panel — authorized personnel only
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-lg font-semibold text-slate-900 mb-6">
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nepexcargo.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build
```

Expected: 0 errors. Route `/login` appears in the build output.

- [ ] **Step 3: Manual verification**

Run `pnpm dev`, navigate to `http://localhost:3002/login`. Confirm:
- Form renders with email + password fields and a "Sign in" button
- Submitting with wrong credentials shows an error message
- Navigating directly to `http://localhost:3002/dashboard` redirects back to `/login?from=/dashboard`

- [ ] **Step 4: Commit**

```bash
git add admin/src/app/login/page.tsx
git commit -m "feat(admin): add login page with JWT cookie auth"
```

---

### Task 4: Protected layout + sidebar

**Files:**
- Create: `admin/src/app/(protected)/layout.tsx`
- Create: `admin/src/components/Sidebar.tsx`
- Create: `admin/src/components/TopBar.tsx`
- Create: `admin/src/context/AuthContext.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/admin/auth/me` → `{ id: string, email: string, name: string }`
- Produces: `(protected)` route group with sidebar + top bar wrapping all child pages

- [ ] **Step 1: Create `admin/src/context/AuthContext.tsx`**

```tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

interface Admin {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  admin: Admin | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    apiFetch<Admin>("/admin/auth/me")
      .then(setAdmin)
      .catch(() => {
        clearToken();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ admin, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 2: Create `admin/src/components/Sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/tenants", label: "Tenants", icon: "🏢" },
  { href: "/plans", label: "Plans", icon: "📋" },
  { href: "/payments", label: "Payments", icon: "💳" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-slate-900 min-h-screen flex flex-col">
      {/* Wordmark */}
      <div className="px-6 py-5 border-b border-slate-800">
        <span className="text-white font-bold text-lg tracking-tight">
          Nepex Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              ].join(" ")}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create `admin/src/components/TopBar.tsx`**

```tsx
"use client";

import { useAuth } from "@/context/AuthContext";

export function TopBar() {
  const { admin, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div /> {/* spacer — breadcrumbs can go here later */}
      <div className="flex items-center gap-4">
        {admin && (
          <span className="text-sm text-slate-600">
            {admin.name ?? admin.email}
          </span>
        )}
        <button
          onClick={logout}
          className="text-sm text-slate-500 hover:text-slate-900 transition"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create `admin/src/app/(protected)/layout.tsx`**

```tsx
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-full min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-6 bg-slate-50 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
```

- [ ] **Step 5: Build check**

```bash
pnpm build
```

Expected: 0 errors. The `(protected)` route group appears in build output.

- [ ] **Step 6: Manual verification**

Run `pnpm dev`, sign in, confirm:
- Dark sidebar visible with all 5 nav links
- Active link highlighted in blue
- Admin name shown in top-right corner
- "Sign out" button clears cookie and returns to `/login`

- [ ] **Step 7: Commit**

```bash
git add admin/src/app/\(protected\)/layout.tsx admin/src/components/Sidebar.tsx admin/src/components/TopBar.tsx admin/src/context/AuthContext.tsx
git commit -m "feat(admin): add protected layout with sidebar, top bar, and auth context"
```

---

### Task 5: Dashboard page

**Files:**
- Create: `admin/src/app/(protected)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/admin/dashboard` → `{ totalTenants: number, activeTenants: number, totalBookings: number, mrr: number }`
- Produces: `/dashboard` — 4 stat cards

- [ ] **Step 1: Create `admin/src/app/(protected)/dashboard/page.tsx`**

This is a **server component** — data is fetched on the server using the cookie from the request headers. Since `getToken()` only works in the browser, the server component reads the `admin_token` cookie directly from the Next.js cookies API.

```tsx
import { cookies } from "next/headers";

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalBookings: number;
  mrr: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  accent?: boolean;
}

function StatCard({ label, value, description, accent }: StatCardProps) {
  return (
    <div
      className={[
        "rounded-xl border p-6",
        accent
          ? "bg-blue-600 border-blue-500 text-white"
          : "bg-white border-slate-200 text-slate-900",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs font-semibold uppercase tracking-wider mb-1",
          accent ? "text-blue-200" : "text-slate-500",
        ].join(" ")}
      >
        {label}
      </p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className={["text-sm", accent ? "text-blue-200" : "text-slate-500"].join(" ")}>
        {description}
      </p>
    </div>
  );
}

async function getStats(): Promise<DashboardStats | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  const BASE =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

  const res = await fetch(`${BASE}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json() as Promise<DashboardStats>;
}

export default async function DashboardPage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <div className="text-slate-500 text-sm">
        Failed to load dashboard stats.
      </div>
    );
  }

  const mrr = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(stats.mrr);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Tenants"
          value={stats.totalTenants}
          description="All registered tenants"
        />
        <StatCard
          label="Active Tenants"
          value={stats.activeTenants}
          description="Currently active"
        />
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          description="Across all tenants"
        />
        <StatCard
          label="MRR"
          value={mrr}
          description="Monthly recurring revenue"
          accent
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build
```

Expected: 0 errors. `/dashboard` listed as a dynamic route.

- [ ] **Step 3: Manual verification**

Run `pnpm dev`, sign in, navigate to `/dashboard`. Confirm:
- 4 stat cards render (if backend is running, real numbers appear; if not, "Failed to load" message)
- MRR card has blue background
- Page title "Dashboard" visible

- [ ] **Step 4: Commit**

```bash
git add admin/src/app/\(protected\)/dashboard/page.tsx
git commit -m "feat(admin): add dashboard stat cards page"
```

---

### Task 6: Tenant management pages

**Files:**
- Create: `admin/src/app/(protected)/tenants/page.tsx`
- Create: `admin/src/app/(protected)/tenants/new/page.tsx`
- Create: `admin/src/app/(protected)/tenants/[id]/page.tsx`

**Interfaces:**
- Consumes:
  - `GET /api/v1/admin/tenants?page=1&limit=20&status=&planId=` → `{ data: Tenant[], total: number, page: number, limit: number }`
  - `POST /api/v1/admin/tenants` → `{ id, ... }`
  - `GET /api/v1/admin/tenants/:id` → `Tenant` (full detail)
  - `PUT /api/v1/admin/tenants/:id/plan` body `{ planId }`
  - `PUT /api/v1/admin/tenants/:id/suspend`
  - `PUT /api/v1/admin/tenants/:id/activate`
  - `POST /api/v1/admin/tenants/:id/impersonate` → `{ impersonateToken: string }`
  - `GET /api/v1/admin/plans` → `{ data: Plan[] }` (for plan selector)
- Produces: `/tenants`, `/tenants/new`, `/tenants/[id]` pages

- [ ] **Step 1: Create `admin/src/app/(protected)/tenants/page.tsx`**

Client component with search input, status filter, and a table of tenants.

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Tenant {
  id: string;
  legalName: string;
  slug: string;
  status: string;
  plan?: { name: string };
  createdAt: string;
}

interface PaginatedTenants {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status ? { status } : {}),
    });

    apiFetch<PaginatedTenants>(`/admin/tenants?${params}`)
      .then((res) => {
        setTenants(res.data);
        setTotal(res.total);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, status]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Tenants</h1>
        <Link
          href="/tenants/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + New Tenant
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <span className="text-sm text-slate-500">{total} tenants</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No tenants found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {t.legalName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    {t.slug}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.plan?.name ?? <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/tenants/${t.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-slate-100 text-slate-600",
    suspended: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={[
        "inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
        colors[status] ?? "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Create `admin/src/app/(protected)/tenants/new/page.tsx`**

```tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
}

export default function NewTenantPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    legalName: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    country: "NP",
    planId: "",
  });

  useEffect(() => {
    apiFetch<{ data: Plan[] }>("/admin/plans")
      .then((res) => setPlans(res.data))
      .catch(() => setPlans([]));
  }, []);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch("/admin/tenants", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/tenants");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create tenant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-900 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">Create Tenant</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Company name"
            id="legalName"
            value={form.legalName}
            onChange={set("legalName")}
            required
            placeholder="Acme Logistics Ltd"
          />
          <Field
            label="Admin email"
            id="email"
            type="email"
            value={form.email}
            onChange={set("email")}
            required
            placeholder="admin@acmelogistics.com"
          />
          <Field
            label="Phone"
            id="phone"
            type="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="+9779801234567"
          />
          <Field
            label="Address"
            id="addressLine1"
            value={form.addressLine1}
            onChange={set("addressLine1")}
            placeholder="123 Main Street"
          />
          <Field
            label="City"
            id="city"
            value={form.city}
            onChange={set("city")}
            placeholder="Kathmandu"
          />
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Country
            </label>
            <input
              id="country"
              value={form.country}
              onChange={set("country")}
              maxLength={2}
              placeholder="NP"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="planId"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Plan
            </label>
            <select
              id="planId"
              value={form.planId}
              onChange={set("planId")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {loading ? "Creating…" : "Create tenant & send invite"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create `admin/src/app/(protected)/tenants/[id]/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  legalName: string;
  slug: string;
  status: string;
  plan?: Plan;
  email?: string;
  phone?: string;
  createdAt: string;
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<Tenant>(`/admin/tenants/${id}`),
      apiFetch<{ data: Plan[] }>("/admin/plans"),
    ])
      .then(([t, p]) => {
        setTenant(t);
        setPlans(p.data);
        setSelectedPlanId(t.plan?.id ?? "");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function doAction(
    label: string,
    fn: () => Promise<unknown>,
    successMsg: string,
  ) {
    setActionLoading(label);
    setError(null);
    setMessage(null);
    try {
      await fn();
      setMessage(successMsg);
      // Re-fetch tenant to get updated status
      const updated = await apiFetch<Tenant>(`/admin/tenants/${id}`);
      setTenant(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionLoading(null);
    }
  }

  async function changePlan() {
    if (!selectedPlanId) return;
    await doAction(
      "plan",
      () =>
        apiFetch(`/admin/tenants/${id}/plan`, {
          method: "PUT",
          body: JSON.stringify({ planId: selectedPlanId }),
        }),
      "Plan updated successfully.",
    );
  }

  async function suspend() {
    await doAction(
      "suspend",
      () => apiFetch(`/admin/tenants/${id}/suspend`, { method: "PUT" }),
      "Tenant suspended.",
    );
  }

  async function activate() {
    await doAction(
      "activate",
      () => apiFetch(`/admin/tenants/${id}/activate`, { method: "PUT" }),
      "Tenant reactivated.",
    );
  }

  async function impersonate() {
    setActionLoading("impersonate");
    setError(null);
    try {
      const res = await apiFetch<{ impersonateToken: string }>(
        `/admin/tenants/${id}/impersonate`,
        { method: "POST" },
      );
      window.open(
        `https://dashboard.nepexcargo.com?impersonateToken=${res.impersonateToken}`,
        "_blank",
        "noopener",
      );
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Impersonation failed.");
      }
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-500">Loading tenant…</div>;
  }

  if (error && !tenant) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!tenant) return null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-900 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">{tenant.legalName}</h1>
        <span
          className={[
            "text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
            tenant.status === "active"
              ? "bg-green-100 text-green-700"
              : tenant.status === "suspended"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600",
          ].join(" ")}
        >
          {tenant.status}
        </span>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Tenant Details
          </h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-500">Slug</dt>
            <dd className="font-mono text-slate-700">{tenant.slug}</dd>
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-700">{tenant.email ?? "—"}</dd>
            <dt className="text-slate-500">Phone</dt>
            <dd className="text-slate-700">{tenant.phone ?? "—"}</dd>
            <dt className="text-slate-500">Plan</dt>
            <dd className="text-slate-700">{tenant.plan?.name ?? "—"}</dd>
            <dt className="text-slate-500">Created</dt>
            <dd className="text-slate-700">
              {new Date(tenant.createdAt).toLocaleDateString()}
            </dd>
          </dl>
        </div>

        {/* Change plan */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Change Plan
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={changePlan}
              disabled={actionLoading === "plan" || !selectedPlanId}
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {actionLoading === "plan" ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {tenant.status === "suspended" ? (
              <button
                onClick={activate}
                disabled={actionLoading === "activate"}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
              >
                {actionLoading === "activate" ? "Activating…" : "Reactivate"}
              </button>
            ) : (
              <button
                onClick={suspend}
                disabled={actionLoading === "suspend"}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition"
              >
                {actionLoading === "suspend" ? "Suspending…" : "Suspend"}
              </button>
            )}
            <button
              onClick={impersonate}
              disabled={actionLoading === "impersonate"}
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition"
            >
              {actionLoading === "impersonate"
                ? "Redirecting…"
                : "Impersonate →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build check**

```bash
pnpm build
```

Expected: 0 errors. Routes `/tenants`, `/tenants/new`, `/tenants/[id]` appear in build output.

- [ ] **Step 5: Manual verification**

Run `pnpm dev`, sign in, navigate to `/tenants`. Confirm:
- Table renders with status filter and "+ New Tenant" button
- Clicking "+ New Tenant" opens the form with all fields and plan dropdown
- Clicking "View →" on a row opens the detail page with info card, plan selector, and action buttons
- "Impersonate" button opens a new tab to `dashboard.nepexcargo.com?impersonateToken=…`

- [ ] **Step 6: Commit**

```bash
git add admin/src/app/\(protected\)/tenants/
git commit -m "feat(admin): add tenant list, create, and detail pages"
```

---

### Task 7: Plan management pages

**Files:**
- Create: `admin/src/app/(protected)/plans/page.tsx`
- Create: `admin/src/app/(protected)/plans/new/page.tsx`
- Create: `admin/src/app/(protected)/plans/[id]/page.tsx`

**Interfaces:**
- Consumes:
  - `GET /api/v1/admin/plans` → `{ data: Plan[] }`
  - `POST /api/v1/admin/plans` body `{ name, price, billingCycle, features }`
  - `PUT /api/v1/admin/plans/:id` body (same shape)
- Produces: `/plans`, `/plans/new`, `/plans/[id]` pages

- [ ] **Step 1: Create `admin/src/app/(protected)/plans/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  active: boolean;
  createdAt: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Plan[] }>("/admin/plans")
      .then((res) => setPlans(res.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Plans</h1>
        <Link
          href="/plans/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + New Plan
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No plans yet. Create one to get started.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Billing</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {plan.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(plan.price)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 capitalize">
                    {plan.billingCycle}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        plan.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {plan.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/plans/${plan.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `admin/src/app/(protected)/plans/new/page.tsx`**

```tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface PlanForm {
  name: string;
  price: string;
  billingCycle: string;
  maxUsers: string;
  maxBookings: string;
  customDomain: boolean;
  apiAccess: boolean;
  active: boolean;
}

const INITIAL_FORM: PlanForm = {
  name: "",
  price: "",
  billingCycle: "monthly",
  maxUsers: "",
  maxBookings: "",
  customDomain: false,
  apiAccess: false,
  active: true,
};

export default function NewPlanPage() {
  const router = useRouter();
  const [form, setForm] = useState<PlanForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      billingCycle: form.billingCycle,
      active: form.active,
      features: {
        maxUsers: form.maxUsers ? parseInt(form.maxUsers) : null,
        maxBookings: form.maxBookings ? parseInt(form.maxBookings) : null,
        customDomain: form.customDomain,
        apiAccess: form.apiAccess,
      },
    };

    try {
      await apiFetch("/admin/plans", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/plans");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-900 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">Create Plan</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Plan name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Starter"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
                Price (USD) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="49.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="billingCycle" className="block text-sm font-medium text-slate-700 mb-1">
                Billing cycle
              </label>
              <select
                id="billingCycle"
                value={form.billingCycle}
                onChange={(e) => setField("billingCycle", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="maxUsers" className="block text-sm font-medium text-slate-700 mb-1">
                Max users (blank = unlimited)
              </label>
              <input
                id="maxUsers"
                type="number"
                min="1"
                value={form.maxUsers}
                onChange={(e) => setField("maxUsers", e.target.value)}
                placeholder="10"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="maxBookings" className="block text-sm font-medium text-slate-700 mb-1">
                Max bookings/mo (blank = unlimited)
              </label>
              <input
                id="maxBookings"
                type="number"
                min="1"
                value={form.maxBookings}
                onChange={(e) => setField("maxBookings", e.target.value)}
                placeholder="500"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Feature flags */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Feature flags
            </p>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.customDomain}
                onChange={(e) => setField("customDomain", e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">Custom domain</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.apiAccess}
                onChange={(e) => setField("apiAccess", e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">API access</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">Active (visible to tenants)</span>
            </label>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {loading ? "Creating…" : "Create plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `admin/src/app/(protected)/plans/[id]/page.tsx`**

Pre-fills the same form with existing plan data and calls `PUT` on submit.

```tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface PlanDetail {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  active: boolean;
  features?: {
    maxUsers?: number | null;
    maxBookings?: number | null;
    customDomain?: boolean;
    apiAccess?: boolean;
  };
}

export default function EditPlanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [maxUsers, setMaxUsers] = useState("");
  const [maxBookings, setMaxBookings] = useState("");
  const [customDomain, setCustomDomain] = useState(false);
  const [apiAccess, setApiAccess] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    apiFetch<PlanDetail>(`/admin/plans/${id}`)
      .then((p) => {
        setPlan(p);
        setName(p.name);
        setPrice(String(p.price));
        setBillingCycle(p.billingCycle);
        setMaxUsers(String(p.features?.maxUsers ?? ""));
        setMaxBookings(String(p.features?.maxBookings ?? ""));
        setCustomDomain(p.features?.customDomain ?? false);
        setApiAccess(p.features?.apiAccess ?? false);
        setActive(p.active);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      name,
      price: parseFloat(price),
      billingCycle,
      active,
      features: {
        maxUsers: maxUsers ? parseInt(maxUsers) : null,
        maxBookings: maxBookings ? parseInt(maxBookings) : null,
        customDomain,
        apiAccess,
      },
    };

    try {
      await apiFetch(`/admin/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setMessage("Plan updated successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update plan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-500">Loading…</div>;
  if (error && !plan) return <div className="text-sm text-red-600">{error}</div>;
  if (!plan) return null;

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-900 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-slate-900">Edit Plan</h1>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Plan name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
                Price (USD)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="billingCycle" className="block text-sm font-medium text-slate-700 mb-1">
                Billing cycle
              </label>
              <select
                id="billingCycle"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="maxUsers" className="block text-sm font-medium text-slate-700 mb-1">
                Max users
              </label>
              <input
                id="maxUsers"
                type="number"
                min="1"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="maxBookings" className="block text-sm font-medium text-slate-700 mb-1">
                Max bookings/mo
              </label>
              <input
                id="maxBookings"
                type="number"
                min="1"
                value={maxBookings}
                onChange={(e) => setMaxBookings(e.target.value)}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Feature flags
            </p>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={customDomain}
                onChange={(e) => setCustomDomain(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">Custom domain</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={apiAccess}
                onChange={(e) => setApiAccess(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">API access</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700">Active</span>
            </label>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Build check**

```bash
pnpm build
```

Expected: 0 errors.

- [ ] **Step 5: Manual verification**

Run `pnpm dev`, sign in, navigate to `/plans`. Confirm:
- Plan table renders with price, billing cycle, and active status
- "+ New Plan" opens the create form with feature flag checkboxes
- Clicking "Edit →" on a plan pre-fills the edit form with existing values
- Saving shows a green "Plan updated successfully." banner

- [ ] **Step 6: Commit**

```bash
git add admin/src/app/\(protected\)/plans/
git commit -m "feat(admin): add plan list, create, and edit pages"
```

---

### Task 8: Payments + Settings pages

**Files:**
- Create: `admin/src/app/(protected)/payments/page.tsx`
- Create: `admin/src/app/(protected)/settings/page.tsx`

**Interfaces:**
- Consumes:
  - `GET /api/v1/admin/payments?tenantId=&from=&to=&status=` → `{ data: Payment[], total: number }`
- Produces: `/payments`, `/settings` pages

- [ ] **Step 1: Create `admin/src/app/(protected)/payments/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Payment {
  id: string;
  tenantId: string;
  tenantName?: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  createdAt: string;
}

interface PaginatedPayments {
  data: Payment[];
  total: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [tenantId, setTenantId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  function loadPayments() {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (tenantId) params.set("tenantId", tenantId);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (status) params.set("status", status);

    apiFetch<PaginatedPayments>(`/admin/payments?${params}`)
      .then((res) => {
        setPayments(res.data);
        setTotal(res.total);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Payments</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Tenant ID
          </label>
          <input
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="uuid…"
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <button
          onClick={loadPayments}
          className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Apply filters
        </button>

        <span className="text-xs text-slate-500 ml-auto self-center">
          {total} records
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No payments match these filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tenant</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Description</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Amount</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {p.tenantName ?? (
                      <span className="font-mono text-xs text-slate-400">
                        {p.tenantId.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: p.currency ?? "USD",
                    }).format(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={[
        "inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
        colors[status] ?? "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Create `admin/src/app/(protected)/settings/page.tsx`**

Static form (no settings API in Plan 2 — values are local-state only; wired up in a future backend task). Fields cover the most common platform-level settings.

```tsx
"use client";

import { useState, FormEvent } from "react";

export default function SettingsPage() {
  const [platformName, setPlatformName] = useState("Nepex Cargo");
  const [supportEmail, setSupportEmail] = useState("support@nepexcargo.com");

  // SMTP
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");

  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: wire to PATCH /api/v1/admin/settings once backend endpoint exists
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">
        Platform Settings
      </h1>

      {saved && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          Settings saved.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">General</h2>

          <div>
            <label
              htmlFor="platformName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Platform name
            </label>
            <input
              id="platformName"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="supportEmail"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Support email
            </label>
            <input
              id="supportEmail"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        {/* SMTP */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">
            SMTP / Email delivery
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="smtpHost"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Host
              </label>
              <input
                id="smtpHost"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.sendgrid.net"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="smtpPort"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Port
              </label>
              <input
                id="smtpPort"
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="smtpUser"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Username
              </label>
              <input
                id="smtpUser"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="apikey"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="smtpPassword"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password / API key
              </label>
              <input
                id="smtpPassword"
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="smtpFromEmail"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                From email
              </label>
              <input
                id="smtpFromEmail"
                type="email"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
                placeholder="noreply@nepexcargo.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="smtpFromName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                From name
              </label>
              <input
                id="smtpFromName"
                value={smtpFromName}
                onChange={(e) => setSmtpFromName(e.target.value)}
                placeholder="Nepex Cargo"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 transition"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: 0 errors. All 9 routes appear in build output:
- `/login`
- `/dashboard`
- `/tenants`
- `/tenants/new`
- `/tenants/[id]`
- `/plans`
- `/plans/new`
- `/plans/[id]`
- `/payments`
- `/settings`

- [ ] **Step 4: Manual verification**

Run `pnpm dev`, sign in, verify:
- `/payments` — filter bar with tenant ID, date range, and status; table renders (empty state shows "No payments match")
- `/settings` — two-section form (General + SMTP); clicking "Save settings" shows green "Settings saved." banner for 3 seconds
- Sidebar highlights the correct link for each page
- Navigating directly to any page while logged out redirects to `/login`

- [ ] **Step 5: Commit**

```bash
git add admin/src/app/\(protected\)/payments/page.tsx admin/src/app/\(protected\)/settings/page.tsx
git commit -m "feat(admin): add payments table with filters and settings form"
```

---

## Self-Review

**URL coverage check:**
- `/login` — Task 3
- `/dashboard` — Task 5
- `/tenants` — Task 6
- `/tenants/new` — Task 6
- `/tenants/[id]` — Task 6
- `/plans` — Task 7
- `/plans/new` — Task 7
- `/plans/[id]` — Task 7
- `/payments` — Task 8
- `/settings` — Task 8

**API endpoint coverage check:**
- `POST /admin/auth/login` — Task 3
- `GET /admin/auth/me` — Task 4 (AuthContext)
- `GET /admin/dashboard` — Task 5
- `GET /admin/tenants` — Task 6 list
- `POST /admin/tenants` — Task 6 new
- `GET /admin/tenants/:id` — Task 6 detail
- `PUT /admin/tenants/:id/plan` — Task 6 detail
- `PUT /admin/tenants/:id/suspend` — Task 6 detail
- `PUT /admin/tenants/:id/activate` — Task 6 detail
- `POST /admin/tenants/:id/impersonate` — Task 6 detail
- `GET /admin/plans` — Tasks 6 + 7
- `POST /admin/plans` — Task 7 new
- `PUT /admin/plans/:id` — Task 7 edit
- `GET /admin/payments` — Task 8

**Design decisions honored:**
- JWT in `admin_token` cookie — `setToken` writes cookie, `clearToken` expires it
- Middleware reads raw cookie header, redirects unauthenticated requests to `/login?from=<path>`
- Protected layout uses `(protected)` route group with `AuthProvider` wrapping children
- Server component for dashboard reads cookie via `cookies()` API
- Impersonate opens `https://dashboard.nepexcargo.com?impersonateToken=<token>` in new tab
- Dark sidebar (`bg-slate-900`) with white content area — correct
- No unit tests for pages — each task has manual verification steps

**Placeholder scan:** No TBDs. Settings form has a `// TODO` comment explicitly noting the future backend endpoint; all other pages are fully wired.
