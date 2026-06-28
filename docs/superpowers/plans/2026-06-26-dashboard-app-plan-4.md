# Dashboard App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the partner + agent dashboard app at dashboard.nepexcargo.com with role-based access.

**Architecture:** Next.js 16 App Router, route groups `(protected)/` and `(setup)/`, cookie-based JWT auth, tenant resolved from subdomain + token.

**Tech Stack:** Next.js 16.2.6, React 19.2.4, Tailwind CSS v4, TypeScript, pnpm

## Global Constraints

- App lives in `dashboard/` directory (sibling to `frontend/` and `admin/`)
- Cookie name: `dashboard_token` (httpOnly)
- API base: `process.env.NEXT_PUBLIC_API_URL` + `/api/v1/tenant`
- `apiFetch()` wrapper reads `dashboard_token` cookie and adds `Authorization: Bearer <token>` header
- JWT payload: `{ sub: userId, tenantId, role: 'partner_owner'|'agent', type: 'tenant_user', impersonatedBy?: adminId }`
- Role-based nav: `partner_owner` sees everything; `agent` sees only Bookings and Tracking
- Impersonation banner: always visible when `impersonatedBy` is set in JWT
- Onboarding gate: middleware redirects to `/setup` if tenant's `onboardingCompleted === false`
- Tailwind v4 with `@tailwindcss/postcss`
- No shared component library — independent component set
- Use `@/*` path alias (`./src/*`) — never long relative paths
- No heavy state management — React Context for auth, `fetch` for data
- Sidebar: dark (`bg-slate-900`) with white content area, matching admin/ pattern
- `pnpm` as package manager
- Commit after each task, not after each file
- Build check: `pnpm build` must pass with 0 errors before each commit

---

### Task 1: Scaffold

**Files to create:**
- `dashboard/package.json`
- `dashboard/tsconfig.json`
- `dashboard/next.config.ts`
- `dashboard/postcss.config.mjs`
- `dashboard/.env.example`
- `dashboard/src/app/globals.css`
- `dashboard/src/app/layout.tsx`

**Goal:** Produce a compilable Next.js 16 app shell that `pnpm build` runs to 0 errors.

- [ ] **Step 1: Create `dashboard/package.json`**

Port `16.2.6` / `19.2.4` version pins from `frontend/package.json`. Dev port 3003 (admin uses 3002).

```json
{
  "name": "dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3003",
    "build": "next build",
    "start": "next start --port 3003",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["sharp", "unrs-resolver"]
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

- [ ] **Step 2: Create `dashboard/tsconfig.json`**

Identical shape to `admin/tsconfig.json`. Paths: `@/*` → `./src/*`.

- [ ] **Step 3: Create `dashboard/next.config.ts`**

```typescript
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

- [ ] **Step 4: Create `dashboard/postcss.config.mjs`**

```javascript
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

- [ ] **Step 5: Create `dashboard/.env.example`**

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

- [ ] **Step 6: Create `dashboard/src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-sidebar: #0f172a;
  --color-sidebar-hover: #1e293b;
  --color-brand: #0ea5e9;
  --color-brand-hover: #0284c7;
}
```

- [ ] **Step 7: Create `dashboard/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nepex Cargo Dashboard",
  description: "Partner and agent dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Install and verify**

```bash
cd dashboard && pnpm install && pnpm build
```

- [ ] **Step 9: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): scaffold Next.js 16 dashboard app with Tailwind v4"
```

---

### Task 2: API client + auth utilities

**Files to create:**
- `dashboard/src/lib/api.ts`
- `dashboard/src/lib/auth.ts`
- `dashboard/src/app/login/page.tsx`
- `dashboard/src/app/invite/accept/page.tsx`

**Key exports:**
- `apiFetch<T>(path, init?)` — fetch wrapper with `dashboard_token` auth header
- `ApiError` — typed error class with `.status`
- `getToken()`, `setToken(token)`, `clearToken()` — browser cookie helpers
- `getTokenPayload()` — base64-decode JWT, return typed payload
- `isImpersonating(payload)` — returns true when `impersonatedBy` is set

- [ ] **Step 1: Create `dashboard/src/lib/auth.ts`**

```typescript
const COOKIE_NAME = "dashboard_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface TokenPayload {
  sub: string;
  tenantId: string;
  role: "partner_owner" | "agent";
  type: "tenant_user";
  impersonatedBy?: string;
  exp?: number;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((r) => r.startsWith(`${COOKIE_NAME}=`));
  return match ? match.split("=")[1] : null;
}

export function setToken(token: string): void {
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearToken(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getTokenPayload(token?: string | null): TokenPayload | null {
  const t = token ?? getToken();
  if (!t) return null;
  try {
    const base64 = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as TokenPayload;
  } catch {
    return null;
  }
}

export function isImpersonating(payload: TokenPayload | null): boolean {
  return !!payload?.impersonatedBy;
}

export { COOKIE_NAME };
```

- [ ] **Step 2: Create `dashboard/src/lib/api.ts`**

API base points at `/api/v1/tenant` (not `/api/v1/admin`). On 401 → clear token and redirect to `/login`.

```typescript
import { clearToken, getToken } from "@/lib/auth";

const BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1/tenant";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
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
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (body as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
```

- [ ] **Step 3: Create `dashboard/src/app/login/page.tsx`**

Email + password form. On success: `setToken(data.token)` + `router.push("/dashboard")`.

Endpoint: `POST /api/v1/tenant/auth/login` → `{ token: string }`.

```tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/auth";

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
      const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1/tenant";
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as { token?: string; message?: string };
      if (!res.ok || !data.token) {
        setError(data.message ?? "Login failed.");
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
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-slate-900">Nepex Cargo</span>
          <p className="text-sm text-slate-500 mt-1">Partner Dashboard</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-lg font-semibold text-slate-900 mb-6">Sign in</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" required placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <input type="password" required placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-sky-600 text-white text-sm font-semibold py-2.5 hover:bg-sky-700 disabled:opacity-60 transition">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `dashboard/src/app/invite/accept/page.tsx`**

Reads `?token=` from URL. Calls `POST /api/v1/tenant/auth/invite/accept` with `{ inviteToken, password }`. On success: set cookie and redirect to `/setup` (onboarding not yet complete).

```tsx
"use client";
import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";

function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteToken = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError(null);
    try {
      const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1/tenant";
      const res = await fetch(`${BASE}/auth/invite/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken, password }),
      });
      const data = await res.json() as { token?: string; message?: string };
      if (!res.ok || !data.token) { setError(data.message ?? "Failed to accept invite."); return; }
      setToken(data.token);
      router.push("/setup");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8">
        <h1 className="text-lg font-semibold text-slate-900 mb-6">Set your password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required placeholder="New password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          <input type="password" required placeholder="Confirm password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-sky-600 text-white text-sm font-semibold py-2.5 hover:bg-sky-700 disabled:opacity-60 transition">
            {loading ? "Activating…" : "Activate account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return <Suspense><AcceptInviteForm /></Suspense>;
}
```

- [ ] **Step 5: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/lib/ dashboard/src/app/login/ dashboard/src/app/invite/
git commit -m "feat(dashboard): add auth helpers, apiFetch wrapper, login and invite accept pages"
```

---

### Task 3: Auth context + middleware

**Files to create:**
- `dashboard/src/context/AuthContext.tsx`
- `dashboard/src/middleware.ts`

**Key exports:**
- `AuthProvider` — wraps protected layout; hydrates user + tenant from `/auth/me`
- `useAuth()` — returns `{ user, tenant, role, impersonatedBy, loading, logout }`
- `middleware` — protects all routes except `/login`, `/invite/*`, `/tracking`; redirects to `/setup` when `tenant.onboardingCompleted === false`

- [ ] **Step 1: Create `dashboard/src/context/AuthContext.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearToken, getToken, getTokenPayload, TokenPayload } from "@/lib/auth";

interface User { id: string; email: string; name: string; }
interface Tenant { id: string; legalName: string; slug: string; onboardingCompleted: boolean; }

interface AuthContextValue {
  user: User | null;
  tenant: Tenant | null;
  payload: TokenPayload | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [payload, setPayload] = useState<TokenPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace("/login"); return; }
    setPayload(getTokenPayload(token));

    apiFetch<{ user: User; tenant: Tenant }>("/auth/me")
      .then(({ user: u, tenant: t }) => {
        setUser(u);
        setTenant(t);
        if (!t.onboardingCompleted) router.replace("/setup");
      })
      .catch(() => { clearToken(); router.replace("/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() { clearToken(); router.push("/login"); }

  return (
    <AuthContext.Provider value={{ user, tenant, payload, loading, logout }}>
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

Endpoint: `GET /api/v1/tenant/auth/me` → `{ user: User, tenant: Tenant }`.

- [ ] **Step 2: Create `dashboard/src/middleware.ts`**

Public paths: `/login`, `/invite`, `/tracking` (public shipment tracker). Everything else requires `dashboard_token` cookie. After token check, decode JWT and check `onboardingCompleted` via a lightweight `/api/v1/tenant/auth/me` call — OR rely on the client-side redirect in `AuthProvider` (simpler). The middleware only guards the cookie presence; the client handles the setup redirect.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/invite", "/tracking"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 3: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/context/ dashboard/src/middleware.ts
git commit -m "feat(dashboard): add AuthContext with tenant/role hydration and route middleware"
```

---

### Task 4: Setup wizard

**Files to create:**
- `dashboard/src/app/(setup)/setup/page.tsx`
- `dashboard/src/app/(setup)/layout.tsx`

**Goal:** Multi-step form accessible only when `onboardingCompleted === false`. On completion calls `PUT /api/v1/tenant/profile/onboarding` then redirects to `/dashboard`.

**Steps:** (1) Company details (name, phone, address, city, country) → (2) Confirmation / Submit.

- [ ] **Step 1: Create `dashboard/src/app/(setup)/layout.tsx`**

Minimal layout — no sidebar. Just renders children with a centered wrapper and Nepex logo.

```tsx
export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold text-slate-900">Nepex Cargo</span>
        <p className="text-sm text-slate-500 mt-1">Account Setup</p>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `dashboard/src/app/(setup)/setup/page.tsx`**

Key component: `SetupWizard`. State: `step: 1 | 2`, `form: CompanyForm`. On step 2 submit → `apiFetch("PUT", "/profile/onboarding", form)` → `router.push("/dashboard")`.

```tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface CompanyForm {
  legalName: string;
  phone: string;
  addressLine1: string;
  city: string;
  country: string;
  vatNumber: string;
}

const EMPTY: CompanyForm = { legalName: "", phone: "", addressLine1: "", city: "", country: "NP", vatNumber: "" };

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<CompanyForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: keyof CompanyForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/profile/onboarding", { method: "PUT", body: JSON.stringify(form) });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className={["flex-1 h-1.5 rounded-full", s <= step ? "bg-sky-500" : "bg-slate-200"].join(" ")} />
        ))}
      </div>

      <h1 className="text-lg font-semibold text-slate-900 mb-1">
        {step === 1 ? "Company details" : "Review & confirm"}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        {step === 1 ? "Tell us about your company." : "Confirm your company information before proceeding."}
      </p>

      <form onSubmit={submit} className="space-y-4">
        {step === 1 && (
          <>
            <input required placeholder="Company legal name" value={form.legalName} onChange={set("legalName")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <input placeholder="Phone" value={form.phone} onChange={set("phone")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <input placeholder="Address" value={form.addressLine1} onChange={set("addressLine1")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="City" value={form.city} onChange={set("city")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              <input placeholder="Country code (NP)" maxLength={2} value={form.country} onChange={set("country")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <input placeholder="VAT / PAN number (optional)" value={form.vatNumber} onChange={set("vatNumber")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </>
        )}

        {step === 2 && (
          <dl className="space-y-2 text-sm">
            {(Object.entries(form) as [keyof CompanyForm, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, " $1")}</dt>
                <dd className="text-slate-900 font-medium">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          {step === 2 && (
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-slate-300 text-sm font-semibold py-2.5 hover:bg-slate-50 transition">
              Back
            </button>
          )}
          <button type="submit" disabled={loading}
            className="flex-1 rounded-lg bg-sky-600 text-white text-sm font-semibold py-2.5 hover:bg-sky-700 disabled:opacity-60 transition">
            {step === 1 ? "Next →" : loading ? "Saving…" : "Complete setup"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/app/\(setup\)/
git commit -m "feat(dashboard): add setup wizard with company details onboarding flow"
```

---

### Task 5: Protected layout + sidebar + impersonation banner

**Files to create:**
- `dashboard/src/app/(protected)/layout.tsx`
- `dashboard/src/components/Sidebar.tsx`
- `dashboard/src/components/TopBar.tsx`
- `dashboard/src/components/ImpersonationBanner.tsx`

**Goal:** Wrap all `/dashboard/**`, `/bookings/**`, etc. in a shell with dark sidebar, top bar with user menu, and optional impersonation banner at the very top.

- [ ] **Step 1: Create `dashboard/src/components/ImpersonationBanner.tsx`**

Only renders when `payload.impersonatedBy` is set.

```tsx
"use client";

import { useAuth } from "@/context/AuthContext";

export function ImpersonationBanner() {
  const { payload, tenant } = useAuth();
  if (!payload?.impersonatedBy) return null;

  return (
    <div className="bg-amber-500 text-amber-950 text-sm font-medium px-4 py-2 flex items-center gap-2">
      <span className="text-base">⚠</span>
      Impersonating as <strong>{tenant?.legalName ?? "tenant"}</strong> — actions are performed on their behalf.
    </div>
  );
}
```

- [ ] **Step 2: Create `dashboard/src/components/Sidebar.tsx`**

`partner_owner` sees all items. `agent` sees only Bookings and Tracking.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface NavItem { href: string; label: string; roles: Array<"partner_owner" | "agent">; }

const NAV: NavItem[] = [
  { href: "/dashboard",    label: "Dashboard",    roles: ["partner_owner"] },
  { href: "/bookings",     label: "Bookings",     roles: ["partner_owner", "agent"] },
  { href: "/tracking",     label: "Tracking",     roles: ["partner_owner", "agent"] },
  { href: "/quotes",       label: "Quotes",       roles: ["partner_owner"] },
  { href: "/rates",        label: "Rate Cards",   roles: ["partner_owner"] },
  { href: "/integrations", label: "Integrations", roles: ["partner_owner"] },
  { href: "/agents",       label: "Agents",       roles: ["partner_owner"] },
  { href: "/settings",     label: "Settings",     roles: ["partner_owner"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { payload } = useAuth();
  const role = payload?.role ?? "agent";

  const visible = NAV.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-60 shrink-0 bg-slate-900 min-h-screen flex flex-col">
      <div className="px-5 py-4 border-b border-slate-800">
        <span className="text-white font-bold text-base tracking-tight">Nepex Cargo</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={["flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition",
                active ? "bg-sky-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"].join(" ")}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create `dashboard/src/components/TopBar.tsx`**

Shows tenant name + user name. Logout button calls `useAuth().logout()`.

```tsx
"use client";

import { useAuth } from "@/context/AuthContext";

export function TopBar() {
  const { user, tenant, logout } = useAuth();
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <span className="text-sm font-medium text-slate-700">{tenant?.legalName}</span>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-slate-500">{user.name}</span>}
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-900 transition">Sign out</button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create `dashboard/src/app/(protected)/layout.tsx`**

```tsx
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ImpersonationBanner />
      <div className="flex h-full min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-6 bg-slate-50 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
```

- [ ] **Step 5: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/app/\(protected\)/ dashboard/src/components/
git commit -m "feat(dashboard): add protected layout, role-based sidebar, top bar, impersonation banner"
```

---

### Task 6: Dashboard stats page

**Files to create:**
- `dashboard/src/app/(protected)/dashboard/page.tsx`

**Endpoint:** `GET /api/v1/tenant/dashboard` → `{ totalBookings: number, activeAgents: number, pendingQuotes: number, walletBalance: number }`

- [ ] **Step 1: Create `dashboard/src/app/(protected)/dashboard/page.tsx`**

Server component — reads cookie via `next/headers`, fetches stats, renders 4 `StatCard` components.

```tsx
import { cookies } from "next/headers";

interface Stats {
  totalBookings: number;
  activeAgents: number;
  pendingQuotes: number;
  walletBalance: number;
}

async function getStats(): Promise<Stats | null> {
  const token = (await cookies()).get("dashboard_token")?.value;
  if (!token) return null;
  const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1/tenant";
  const res = await fetch(`${BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<Stats>;
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={["rounded-xl border p-6", accent ? "bg-sky-600 border-sky-500 text-white" : "bg-white border-slate-200"].join(" ")}>
      <p className={["text-xs font-semibold uppercase tracking-wider mb-1", accent ? "text-sky-200" : "text-slate-500"].join(" ")}>{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getStats();
  if (!stats) return <p className="text-slate-500 text-sm">Failed to load stats.</p>;

  const balance = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.walletBalance);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={stats.totalBookings.toLocaleString()} />
        <StatCard label="Active Agents" value={stats.activeAgents} />
        <StatCard label="Pending Quotes" value={stats.pendingQuotes} />
        <StatCard label="Wallet Balance" value={balance} accent />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/app/\(protected\)/dashboard/
git commit -m "feat(dashboard): add dashboard stats page with 4 stat cards"
```

---

### Task 7: Rate management pages (partner_owner only)

**Files to create:**
- `dashboard/src/app/(protected)/rates/page.tsx` — rate cards list
- `dashboard/src/app/(protected)/rates/new/page.tsx` — create rate card (name, carrier, weight tiers)
- `dashboard/src/app/(protected)/rates/[id]/page.tsx` — edit rate card
- `dashboard/src/app/(protected)/rates/zones/page.tsx` — zones list
- `dashboard/src/app/(protected)/rates/zones/new/page.tsx` — create zone (name, countries list)
- `dashboard/src/app/(protected)/rates/zones/[id]/page.tsx` — edit zone

**Key component names:** `RateCardsPage`, `NewRateCardPage`, `EditRateCardPage`, `ZonesPage`, `NewZonePage`, `EditZonePage`

**Endpoints:**
- `GET /api/v1/tenant/rates` → `{ data: RateCard[] }`
- `POST /api/v1/tenant/rates` body `{ name, carrierId, zoneId, tiers: [{ minWeight, maxWeight, price }] }`
- `PUT /api/v1/tenant/rates/:id`
- `GET /api/v1/tenant/zones` → `{ data: Zone[] }`
- `POST /api/v1/tenant/zones` body `{ name, countries: string[] }`
- `PUT /api/v1/tenant/zones/:id`

- [ ] **Step 1: Create zones list + form pages**

`ZonesPage` — table with zone name, country count, edit link. `NewZonePage` / `EditZonePage` — name field + comma-separated countries textarea (split on save).

Example weight tier row in rate card form:
```tsx
// WeightTier row — repeated per tier, add/remove buttons
<div className="flex items-center gap-2">
  <input type="number" placeholder="Min kg" value={tier.minWeight}
    onChange={(e) => updateTier(i, "minWeight", e.target.value)}
    className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
  <span className="text-slate-400">–</span>
  <input type="number" placeholder="Max kg" value={tier.maxWeight}
    onChange={(e) => updateTier(i, "maxWeight", e.target.value)}
    className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
  <input type="number" placeholder="Price USD" value={tier.price}
    onChange={(e) => updateTier(i, "price", e.target.value)}
    className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
  <button type="button" onClick={() => removeTier(i)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
</div>
```

- [ ] **Step 2: Create rate cards list + form pages**

`RateCardsPage` — table of rate cards (name, carrier, zone, tier count). `NewRateCardPage` — name, carrier select, zone select, dynamic weight tier list with "Add tier" button. `EditRateCardPage` — same form pre-filled.

- [ ] **Step 3: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/app/\(protected\)/rates/
git commit -m "feat(dashboard): add rate card and zone management pages"
```

---

### Task 8: Integrations page (partner_owner only)

**Files to create:**
- `dashboard/src/app/(protected)/integrations/page.tsx`
- `dashboard/src/components/IntegrationDrawer.tsx`

**Goal:** Grid of integration cards (DHL, Aramex, FedEx, Stripe, Khalti, eSewa). Each card has a toggle switch and a "Configure" button. Clicking "Configure" opens a slide-in drawer with provider-specific credentials form.

**Endpoints:**
- `GET /api/v1/tenant/integrations` → `{ data: Integration[] }` where each has `{ id, provider, enabled, credentials }`
- `PUT /api/v1/tenant/integrations/:id` body `{ enabled?, credentials? }`

**Key component names:** `IntegrationsPage`, `IntegrationCard`, `IntegrationDrawer`

- [ ] **Step 1: Create `dashboard/src/app/(protected)/integrations/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { IntegrationDrawer } from "@/components/IntegrationDrawer";

interface Integration {
  id: string;
  provider: string;
  enabled: boolean;
  credentials: Record<string, string>;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selected, setSelected] = useState<Integration | null>(null);

  useEffect(() => {
    apiFetch<{ data: Integration[] }>("/integrations").then((r) => setIntegrations(r.data));
  }, []);

  async function toggleEnabled(id: string, enabled: boolean) {
    await apiFetch(`/integrations/${id}`, { method: "PUT", body: JSON.stringify({ enabled }) });
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, enabled } : i)));
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Integrations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((int) => (
          <div key={int.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 capitalize">{int.provider}</span>
              {/* Toggle switch */}
              <button
                onClick={() => toggleEnabled(int.id, !int.enabled)}
                className={["relative inline-flex h-6 w-11 items-center rounded-full transition",
                  int.enabled ? "bg-sky-600" : "bg-slate-300"].join(" ")}>
                <span className={["inline-block h-4 w-4 transform rounded-full bg-white transition",
                  int.enabled ? "translate-x-6" : "translate-x-1"].join(" ")} />
              </button>
            </div>
            <p className="text-xs text-slate-500">{int.enabled ? "Connected" : "Not connected"}</p>
            <button onClick={() => setSelected(int)}
              className="mt-auto text-sm font-medium text-sky-600 hover:text-sky-800 text-left">
              Configure →
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <IntegrationDrawer
          integration={selected}
          onClose={() => setSelected(null)}
          onSave={async (creds) => {
            await apiFetch(`/integrations/${selected.id}`, { method: "PUT", body: JSON.stringify({ credentials: creds }) });
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `dashboard/src/components/IntegrationDrawer.tsx`**

Slide-in panel from the right. Renders a generic key-value form (field names derived from provider type). On save calls `onSave(credentials)`.

```tsx
"use client";

import { useState } from "react";

const PROVIDER_FIELDS: Record<string, string[]> = {
  dhl: ["apiKey", "accountNumber", "siteId"],
  aramex: ["username", "password", "accountNumber", "accountPin", "accountEntity", "accountCountryCode"],
  fedex: ["apiKey", "secretKey", "accountNumber"],
  stripe: ["publishableKey", "secretKey", "webhookSecret"],
  khalti: ["publicKey", "secretKey"],
  esewa: ["merchantCode", "secretKey"],
};

interface Props {
  integration: { id: string; provider: string; credentials: Record<string, string> };
  onClose: () => void;
  onSave: (credentials: Record<string, string>) => Promise<void>;
}

export function IntegrationDrawer({ integration, onClose, onSave }: Props) {
  const fields = PROVIDER_FIELDS[integration.provider.toLowerCase()] ?? [];
  const [creds, setCreds] = useState<Record<string, string>>(integration.credentials ?? {});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try { await onSave(creds); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 capitalize">{integration.provider} Credentials</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                {field.replace(/([A-Z])/g, " $1")}
              </label>
              <input value={creds[field] ?? ""} onChange={(e) => setCreds((c) => ({ ...c, [field]: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-slate-200">
          <button onClick={handleSave} disabled={saving}
            className="w-full rounded-lg bg-sky-600 text-white text-sm font-semibold py-2.5 hover:bg-sky-700 disabled:opacity-60 transition">
            {saving ? "Saving…" : "Save credentials"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/app/\(protected\)/integrations/ dashboard/src/components/IntegrationDrawer.tsx
git commit -m "feat(dashboard): add integrations page with toggle and slide-in credentials drawer"
```

---

### Task 9: Agent management pages (partner_owner only)

**Files to create:**
- `dashboard/src/app/(protected)/agents/page.tsx`
- `dashboard/src/app/(protected)/agents/new/page.tsx`
- `dashboard/src/app/(protected)/agents/[id]/page.tsx`

**Key component names:** `AgentsPage`, `NewAgentPage`, `AgentDetailPage`

**Endpoints:**
- `GET /api/v1/tenant/agents` → `{ data: Agent[] }`
- `POST /api/v1/tenant/agents` body `{ name, email, creditLimit }` → creates user + sends invite
- `GET /api/v1/tenant/agents/:id` → `Agent` (includes `walletBalance`, `creditLimit`)
- `POST /api/v1/tenant/agents/:id/topup` body `{ amount }`
- `PUT /api/v1/tenant/agents/:id/credit-limit` body `{ creditLimit }`

- [ ] **Step 1: `agents/page.tsx`** — table of agents with name, email, wallet balance, credit limit. "+ Invite Agent" button links to `agents/new`.

- [ ] **Step 2: `agents/new/page.tsx`** — form with name, email, credit limit fields. Calls `POST /agents`. On success redirects to `/agents`.

- [ ] **Step 3: `agents/[id]/page.tsx`** — agent detail with two action cards:
  - "Wallet Top-up": amount input + "Top up" button → `POST /agents/:id/topup`
  - "Credit Limit": number input + "Update" button → `PUT /agents/:id/credit-limit`

Example detail action card:
```tsx
<div className="bg-white rounded-xl border border-slate-200 p-5">
  <h2 className="text-sm font-semibold text-slate-700 mb-3">Wallet Top-up</h2>
  <p className="text-sm text-slate-500 mb-4">Current balance: <strong>{balance}</strong></p>
  <div className="flex items-center gap-3">
    <input type="number" min="1" step="0.01" value={topupAmount}
      onChange={(e) => setTopupAmount(e.target.value)} placeholder="Amount (USD)"
      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
    <button onClick={doTopup} disabled={topping}
      className="text-sm font-semibold px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition">
      {topping ? "…" : "Top up"}
    </button>
  </div>
</div>
```

- [ ] **Step 4: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/app/\(protected\)/agents/
git commit -m "feat(dashboard): add agent management pages with wallet top-up and credit limit"
```

---

### Task 10: Booking pages (both roles)

**Files to create:**
- `dashboard/src/app/(protected)/bookings/page.tsx`
- `dashboard/src/app/(protected)/bookings/new/page.tsx`
- `dashboard/src/app/(protected)/bookings/[id]/page.tsx`

**Key component names:** `BookingsPage`, `NewBookingPage`, `BookingDetailPage`, `StatusTimeline`

**Endpoints:**
- `GET /api/v1/tenant/bookings?status=&from=&to=&agentId=&page=` → `{ data: Booking[], total: number }`
- `POST /api/v1/tenant/bookings` body (6 sections below)
- `GET /api/v1/tenant/bookings/:id` → `Booking` with `statusHistory: [{ status, timestamp, note }]`

**Create booking form fields (6 sections):**
1. Sender: name, phone, address, city, country
2. Receiver: name, phone, address, city, country
3. Parcel: weight (kg), dimensions (L×W×H cm), description, value (USD)
4. Service: carrier select, rate card select, service type
5. Pickup: pickupDate, pickupInstructions
6. Payment: paymentMethod (wallet | credit | cod)

- [ ] **Step 1: `bookings/page.tsx`** — table with tracking number, sender, receiver, status badge, created date. Filter bar: status select, date range inputs, search by tracking number. Pagination.

- [ ] **Step 2: `bookings/new/page.tsx`** — multi-section form (not multi-step). All 6 sections visible at once, grouped with `<fieldset>` and `<legend>` for visual separation. On submit: `POST /bookings`, redirect to `/bookings/[id]`.

Example status badge:
```tsx
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  picked_up: "bg-blue-100 text-blue-700",
  in_transit: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={["text-xs font-semibold px-2 py-0.5 rounded-full capitalize",
      STATUS_COLORS[status] ?? "bg-slate-100 text-slate-600"].join(" ")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
```

- [ ] **Step 3: `bookings/[id]/page.tsx`** — detail view with sender/receiver cards, parcel info, and a vertical `StatusTimeline` component showing each `statusHistory` entry with timestamp and note.

```tsx
function StatusTimeline({ history }: { history: Array<{ status: string; timestamp: string; note?: string }> }) {
  return (
    <ol className="relative border-l border-slate-200 space-y-6 pl-6">
      {history.map((h, i) => (
        <li key={i} className="relative">
          <div className="absolute -left-[26px] w-3 h-3 rounded-full bg-sky-500 border-2 border-white" />
          <p className="text-sm font-semibold text-slate-900 capitalize">{h.status.replace(/_/g, " ")}</p>
          <time className="text-xs text-slate-500">{new Date(h.timestamp).toLocaleString()}</time>
          {h.note && <p className="text-xs text-slate-600 mt-0.5">{h.note}</p>}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/app/\(protected\)/bookings/
git commit -m "feat(dashboard): add bookings list, create form, and detail with status timeline"
```

---

### Task 11: Quote requests, public tracking, and settings

**Files to create:**
- `dashboard/src/app/(protected)/quotes/page.tsx`
- `dashboard/src/app/tracking/page.tsx` (public — no auth)
- `dashboard/src/app/(protected)/settings/profile/page.tsx`
- `dashboard/src/app/(protected)/settings/billing/page.tsx`
- `dashboard/src/app/(protected)/settings/page.tsx` (redirect to profile)

**Endpoints:**
- `GET /api/v1/tenant/quotes?status=` → `{ data: Quote[] }`
- `PUT /api/v1/tenant/quotes/:id/accept`
- `PUT /api/v1/tenant/quotes/:id/reject`
- `GET /api/v1/tenant/tracking/:trackingNumber` (public — no auth header needed)
- `GET /api/v1/tenant/settings/profile` → `{ legalName, email, phone, ... }`
- `PUT /api/v1/tenant/settings/profile`
- `GET /api/v1/tenant/settings/billing` → `{ plan, nextBillingDate, invoices: [] }`

- [ ] **Step 1: `quotes/page.tsx`**

Table of quote requests: customer name, origin, destination, weight, requested rate. Status filter (pending / accepted / rejected). Each pending row has "Accept" and "Reject" buttons inline that call the respective endpoints and update local state.

```tsx
// Inline accept/reject buttons on pending quotes
{quote.status === "pending" && (
  <div className="flex gap-2">
    <button onClick={() => doAction(quote.id, "accept")}
      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700">
      Accept
    </button>
    <button onClick={() => doAction(quote.id, "reject")}
      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">
      Reject
    </button>
  </div>
)}
```

- [ ] **Step 2: `tracking/page.tsx`** (public — no `(protected)` group)

Search form with tracking number input. On submit: `GET /api/v1/tenant/tracking/:trackingNumber` (public endpoint, no token). Displays status timeline and parcel info if found.

Note: this page must also be listed in `middleware.ts` PUBLIC_PATHS so middleware allows unauthenticated access.

```tsx
"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function TrackingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(params.get("t") ?? "");
  const [result, setResult] = useState<unknown>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotFound(false);
    const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1/tenant";
    const res = await fetch(`${BASE}/tracking/${trackingNumber}`);
    if (res.status === 404) { setNotFound(true); return; }
    const data = await res.json();
    setResult(data);
    router.replace(`/tracking?t=${trackingNumber}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Track Shipment</h1>
      <p className="text-sm text-slate-500 mb-8">Enter your tracking number to see the latest status.</p>
      <form onSubmit={handleSearch} className="flex gap-3 w-full max-w-lg">
        <input required value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="NPEX1234567890"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
        <button type="submit"
          className="rounded-lg bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 hover:bg-sky-700 transition">
          Track
        </button>
      </form>
      {notFound && <p className="mt-6 text-sm text-red-600">Tracking number not found.</p>}
      {result && (
        <pre className="mt-6 bg-white rounded-xl border border-slate-200 p-5 text-xs text-slate-700 max-w-lg w-full overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return <Suspense><TrackingForm /></Suspense>;
}
```

- [ ] **Step 3: `settings/page.tsx`** — redirect to `/settings/profile`

```tsx
import { redirect } from "next/navigation";
export default function SettingsPage() { redirect("/settings/profile"); }
```

- [ ] **Step 4: `settings/profile/page.tsx`**

Server-rendered form pre-filled from `GET /settings/profile`. Edit and save via `PUT /settings/profile`. Fields: legalName, email, phone, address, city, country, VAT number.

- [ ] **Step 5: `settings/billing/page.tsx`**

Shows current plan name, next billing date, and a read-only list of past invoices (date, amount, status, download link).

- [ ] **Step 6: Build check + commit**

```bash
cd dashboard && pnpm build
git add dashboard/src/app/\(protected\)/quotes/ \
        dashboard/src/app/tracking/ \
        dashboard/src/app/\(protected\)/settings/
git commit -m "feat(dashboard): add quote requests, public tracking page, and settings sub-pages"
```

---

## Summary

| # | Task | Route(s) | Role |
|---|------|----------|------|
| 1 | Scaffold | — | — |
| 2 | Auth + API client | `/login`, `/invite/accept` | public |
| 3 | Middleware + AuthContext | all routes | system |
| 4 | Setup wizard | `/setup` | any (pre-onboarding) |
| 5 | Protected layout | layout shell | all authenticated |
| 6 | Dashboard stats | `/dashboard` | partner_owner |
| 7 | Rate management | `/rates/**`, `/rates/zones/**` | partner_owner |
| 8 | Integrations | `/integrations` | partner_owner |
| 9 | Agent management | `/agents/**` | partner_owner |
| 10 | Bookings | `/bookings/**` | both |
| 11 | Quotes + Tracking + Settings | `/quotes`, `/tracking`, `/settings/**` | mixed |
